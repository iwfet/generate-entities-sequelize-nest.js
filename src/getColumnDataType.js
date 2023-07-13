export function getColumnDataType(columnType) {
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