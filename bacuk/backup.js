const fs = require("fs");
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../sequelize").default;

// Função para gerar entidades
async function generateEntities() {
  const tables = await sequelize.query(
    `
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE';
    `,
    { type: Sequelize.QueryTypes.SELECT }
  );

  for (const table of tables) {
    const tableName = table.table_name;
    const attributes = {};

    const columns = await sequelize.query(
      `
        SELECT c.column_name, c.data_type, c.is_nullable,c.character_maximum_length , c.column_default,tc.constraint_type
        FROM information_schema.columns c
        LEFT JOIN information_schema.key_column_usage ku ON c.column_name = ku.column_name AND c.table_name = ku.table_name and ku.constraint_schema = 'public'
        LEFT JOIN information_schema.table_constraints tc ON ku.constraint_name = tc.constraint_name
        WHERE c.table_name ='${tableName}';
        
        `,
      { type: Sequelize.QueryTypes.SELECT }
    );

    for (const column of columns) {
      const columnName = column.column_name;
      const maxLength = column.character_maximum_length;
      const columnType = mapColumnType(column.data_type, maxLength);
      const allowNull = column.is_nullable === "YES";
      const defaultValue = column.column_default;
      const constraintType = column.constraint_type;

      const columnDefinition = {
        type: columnType,
      };
      if (constraintType !== "PRIMARY KEY") {
        columnDefinition.allowNull = allowNull;
      }

      if (defaultValue !== null && defaultValue !== undefined) {
        if (constraintType !== "PRIMARY KEY") {
          const value = getColumnDataType(columnType);
          if (value === "number") {
            columnDefinition.defaultValue = Number(defaultValue);
          } else if (value === "boolean") {
            columnDefinition.defaultValue = Boolean(defaultValue);
          } else if (value === "Date") {
            columnDefinition.defaultValue = DataTypes.NOW;
          } else if (value === "string") {
            columnDefinition.defaultValue = defaultValue;
          }
        }
      }

      if (
        constraintType &&
        constraintType !== null &&
        constraintType !== undefined
      ) {
        if (constraintType === "PRIMARY KEY") {
          columnDefinition.primaryKey = true;
          columnDefinition.autoIncrement = true;
        } else if (constraintType === "UNIQUE") {
          columnDefinition.unique = true;
        }
      }

      attributes[columnName] = columnDefinition;
    }

    const formateNome = transformarNome(tableName);

    const entityTemplate = `
      import { Table, Column, Model, DataTypes } from 'sequelize-typescript';

      @Table({
        tableName: '${tableName}',
      })
      export class ${formateNome} extends Model<${formateNome}> {
        ${Object.entries(attributes)
          .map(([columnName, columnDefinition]) =>
            getColumnDecorator(columnDefinition, columnName)
          )
          .join("\n")}
      }
    `;

    fs.writeFileSync(`./entities/${formateNome}.entity.ts`, entityTemplate);
  }
}

function mapColumnType(dataType, maxLength) {
  // Mapeie os tipos de coluna do PostgreSQL para os tipos do Sequelize/DataTypes
  if (dataType === "integer") {
    return "DataTypes.INTEGER";
  } else if (dataType === "bigint") {
    if (maxLength) return `DataTypes.BIGINT(${maxLength})`;
    return "DataTypes.BIGINT";
  } else if (dataType === "smallint") {
    return "DataTypes.SMALLINT";
  } else if (
    dataType === "numeric" ||
    dataType === "real" ||
    dataType === "double precision"
  ) {
    return "DataTypes.NUMBER";
  } else if (
    dataType === "character" ||
    dataType === "char" ||
    dataType === "character varying" ||
    dataType === "varchar"
  ) {
    if (maxLength) return `DataTypes.STRING(${maxLength})`;
    return "DataTypes.STRING";
  } else if (dataType === "text") {
    return "DataTypes.TEXT";
  } else if (dataType === "boolean") {
    return "DataTypes.BOOLEAN";
  } else if (
    dataType === "date" ||
    dataType === "timestamp" ||
    dataType === "timestamp without time zone"
  ) {
    return "DataTypes.DATE";
  } else if (dataType === "time" || dataType === "time without time zone") {
    return "DataTypes.TIME";
  } else if (dataType === "bytea") {
    return "DataTypes.BLOB";
  }
  // Adicione mais mapeamentos de tipos conforme necessário
  return "DataTypes.STRING";
}

function getColumnDecorator(columnDefinition, columnName) {
  let decorator = `@Column(${JSON.stringify(columnDefinition).replace(
    /"type":\s*"([^"]+)"/,
    `"type": ${columnDefinition.type}`
  )})`;

  return `${decorator}\n${columnName}: ${getColumnDataType(
    columnDefinition.type
  )};`;
}

function getColumnDataType(columnType) {
  // Mapeie os tipos de coluna do Sequelize/DataTypes para os tipos do TypeScript
  if (columnType === "DataTypes.INTEGER") {
    return "number";
  } else if (columnType === "DataTypes.BIGINT") {
    return "number";
  } else if (columnType === "DataTypes.SMALLINT") {
    return "number";
  } else if (String(columnType).includes("DataTypes.NUMBER")) {
    return "number";
  } else if (String(columnType).includes("DataTypes.STRING")) {
    return "string";
  } else if (columnType === "DataTypes.TEXT") {
    return "string";
  } else if (columnType === "DataTypes.BOOLEAN") {
    return "boolean";
  } else if (columnType === "DataTypes.DATE") {
    return "Date";
  } else if (columnType === "DataTypes.TIME") {
    return "string";
  } else if (columnType === "DataTypes.BLOB") {
    return "Buffer";
  }
  // Adicione mais mapeamentos de tipos conforme necessário
  return "string";
}

function transformarNome(nome) {
  var palavras = nome.split("_");
  var resultado = palavras.map(function (palavra) {
    return palavra.charAt(0).toUpperCase() + palavra.slice(1);
  });
  resultado = resultado.join("");
  if (resultado.length === 1) {
    resultado = resultado.charAt(0).toUpperCase() + resultado.slice(1);
  }
  return resultado;
}

generateEntities();
