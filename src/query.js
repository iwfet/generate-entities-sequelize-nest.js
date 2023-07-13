import { Sequelize } from "sequelize";
import sequelize from "../sequelize.js";

export const tabela = await sequelize.query(
  `
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE';
    `,
  { type: Sequelize.QueryTypes.SELECT }
);

export const colunas = async(tableName)=> await sequelize.query(
  `
      SELECT c.column_name, c.data_type, c.is_nullable,c.character_maximum_length , c.column_default,tc.constraint_type
      FROM information_schema.columns c
      LEFT JOIN information_schema.key_column_usage ku ON c.column_name = ku.column_name AND c.table_name = ku.table_name and ku.constraint_schema = 'public'
      LEFT JOIN information_schema.table_constraints tc ON ku.constraint_name = tc.constraint_name
      WHERE c.table_name ='${tableName}';
    `,
  { type: Sequelize.QueryTypes.SELECT }
);

export const chaves = async(tableName,columnName)=> await sequelize.query(
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

// export const tipoASociacao = await sequelize.query(
//   `
//     SELECT COUNT(*) AS total_rows
//     FROM ${tableName} a
//     JOIN ${foreign_table_name} b 
//     ON b.${foreign_column_name} = a.${column_name}
//     GROUP BY a.${column_name}, b.${foreign_column_name}
//     ORDER BY total_rows DESC;
//   `,
//   { type: Sequelize.QueryTypes.SELECT }
// );
