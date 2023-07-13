import fs from "fs";
import { mapColumnType } from "./mapColumnType.js";
import { getColumnDataType } from "./getColumnDataType.js";
import { chaves, colunas, tabela } from "./query.js";

// Função para gerar entidades
async function generateEntities() {
  const tables = await tabela

  for (const table of tables) {
    const tableName = table.table_name;
    const attributes = {};
    const foreignKeys = {};

    const columns = await colunas(tableName)

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
            const foreignKey = await chaves(tableName,columnName)

            if (foreignKey.length > 0) {
              const {
                column_name,
                foreign_table_name,
                foreign_column_name,
                is_nullable,
                data_type,
              } = foreignKey[0];
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



function getColumnDecorator(columnDefinition, columnName) {
  let decorator = `@Column(${JSON.stringify(columnDefinition).replace(
    /"type":\s*"([^"]+)"/,
    `"type": ${columnDefinition.type}`
  )})`;

  return `${decorator}\n  ${columnName}: ${getColumnDataType(
    columnDefinition.type
  )};`;
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
