import fs from "fs";
import { Sequelize, DataTypes } from "sequelize";
import sequelize from "../sequelize.js";

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
    const foreignKeys = {};

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
      if (columnName !== "expiration_date") {
        const maxLength = column.character_maximum_length;
        const columnType = mapColumnType(column.data_type, maxLength);
        const allowNull = column.is_nullable === "YES";
        const defaultValue = column.column_default;
        const constraintType = column.constraint_type;

        const columnDefinition = {
          type: columnType,
        };

        if (constraintType !== "FOREIGN KEY") {
          if (constraintType !== "PRIMARY KEY" || constraintType !== "UNIQUE") {
            columnDefinition.allowNull = allowNull;
          }
          if (isEmpty(defaultValue)) {
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
        }

        if (isEmpty(constraintType)) {
          if (constraintType === "PRIMARY KEY") {
            columnDefinition.primaryKey = true;
            columnDefinition.autoIncrement = true;
          } else if (constraintType === "UNIQUE") {
            columnDefinition.unique = true;
          } else if (constraintType === "FOREIGN KEY") {
            const foreignKey = await sequelize.query(
              `
            SELECT kcu.column_name, ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name, c.is_nullable, c.data_type
            FROM information_schema.key_column_usage kcu
            JOIN information_schema.constraint_column_usage ccu ON kcu.constraint_name = ccu.constraint_name
            LEFT JOIN information_schema.columns c ON kcu.table_name = c.table_name AND kcu.column_name = c.column_name
            LEFT JOIN information_schema.table_constraints tc ON kcu.constraint_name = tc.constraint_name
            WHERE kcu.table_name = '${tableName}' AND kcu.column_name = '${columnName}'
            AND tc.constraint_type ='FOREIGN KEY';
          `,
              { type: Sequelize.QueryTypes.SELECT }
            );

            if (foreignKey.length > 0) {
              const {
                column_name,
                foreign_table_name,
                foreign_column_name,
                is_nullable,
                data_type,
              } = foreignKey[0];

              const tipoASociacao = await sequelize.query(
                `
                SELECT COUNT(*) AS total_rows
                FROM ${tableName} a
                JOIN ${foreign_table_name} b 
                ON b.${foreign_column_name} = a.${column_name}
                GROUP BY a.${column_name}, b.${foreign_column_name}
                ORDER BY total_rows DESC;
              `,
                { type: Sequelize.QueryTypes.SELECT }
              );

              foreignKeys[column_name] = {
                foreign_table_name,
                foreign_column_name,
                is_nullable,
                data_type,
                tableName,
              };
            }
          }
        }
        if (constraintType !== "FOREIGN KEY") {
          attributes[columnName] = columnDefinition;
        }
      }
    }

    const formateNome = transformarNome(tableName);
    const nomeArquivo = toCamelCase(tableName);
    fs.mkdirSync(`./entities/${nomeArquivo}`);
    const entityTemplate = `
      import { Table, Column, Model, DataTypes, ForeignKey,  BelongsTo } from 'sequelize-typescript';
      ${generateImportStatements(foreignKeys)}

      @Table({
        tableName: '${tableName}',
      })
      export class ${formateNome} extends Model<${formateNome}> {
        ${generateAttributeDecorators(attributes)}

        ${generateForeignKeyDecorators(foreignKeys)}
      }

    `;
    fs.writeFileSync(
      `./entities/${nomeArquivo}/${nomeArquivo}.entity.ts`,
      entityTemplate
    );

    const provider = `
    import { ${formateNome} } from './${nomeArquivo}.entity';

    export const ${nomeArquivo}Provider = [
      {
        provide: ${tableName.toUpperCase()}_REPOSITORY,
        useValue:  ${formateNome},
      },
    ];
    `;

    fs.writeFileSync(
      `./entities/${nomeArquivo}/${nomeArquivo}.provider.ts`,
      provider
    );
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

  return `${decorator}\n  ${columnName}: ${getColumnDataType(
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
  const palavras = nome.split("_");
  const resultado = palavras
    .map(function (palavra) {
      return palavra.charAt(0).toUpperCase() + palavra.slice(1);
    })
    .join("");

  return resultado.charAt(0).toUpperCase() + resultado.slice(1);
}
function toCamelCase(str) {
  return str.replace(/_([a-z])/g, function (match, char) {
    return char.toUpperCase();
  });
}

function generateImportStatements(foreignKeys) {
  const importStatements = Object.values(foreignKeys)
    .map(
      ({ foreign_table_name }) =>
        `import { ${transformarNome(
          foreign_table_name
        )} } from './${transformarNome(foreign_table_name)}.entity';`
    )
    .join("\n");

  return importStatements;
}

function generateAttributeDecorators(attributes) {
  const attributeDecorators = Object.entries(attributes)
    .map(([columnName, columnDefinition]) =>
      getColumnDecorator(columnDefinition, columnName)
    )
    .join("\n");

  return attributeDecorators;
}

function generateForeignKeyDecorators(foreignKeys) {
  const foreignKeyDecorators = Object.entries(foreignKeys)
    .map(
      ([
        columnName,
        { foreign_table_name, foreign_column_name, is_nullable, data_type },
      ]) =>
        getForeignKeyDecorator(
          columnName,
          foreign_table_name,
          foreign_column_name,
          is_nullable,
          data_type
        )
    )
    .join("\n");

  return foreignKeyDecorators;
}

function getForeignKeyDecorator(
  columnName,
  foreign_table_name,
  foreign_column_name,
  is_nullable,
  data_type
) {
  const columnType = mapColumnType(data_type);
  const allowNull = is_nullable === "YES" ? ", allowNull: true" : "";
  return `@ForeignKey(() => ${transformarNome(foreign_table_name)})
  @Column({
    type: ${columnType}${allowNull},
  })
  ${columnName}: ${getColumnDataType(columnType)};\n
  @BelongsTo(() => ${transformarNome(foreign_table_name)})
  ${columnName}_id: ${getColumnDataType(columnType)};\n
  `;
}

function isEmpty(params) {
  return params && params !== null && params !== undefined;
}
generateEntities();
