import Sequelize from "sequelize";

// Configurações do banco de dados
// const databaseConfig = {
//   database: 'api-preci-hotel',
//   username: 'api-preci-hotel',
//   password: 'api-preci-hotel',
//   host: 'localhost',
//   dialect: 'postgres',
// };

const databaseConfig = {
  database: "CloudSystem",
  username: "postgres",
  password: "ADMINROOT",
  host: "localhost",
  dialect: "postgres",
};
// Inicialização do Sequelize
const sequelize = new Sequelize(
  databaseConfig.database,
  databaseConfig.username,
  databaseConfig.password,
  {
    host: databaseConfig.host,
    dialect: databaseConfig.dialect,
    logging: false, 
  }
);

// Exporta o sequelize para uso em outros arquivos
export default sequelize;
