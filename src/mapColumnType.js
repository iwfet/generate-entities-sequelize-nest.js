export function mapColumnType(dataType, maxLength) {
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
