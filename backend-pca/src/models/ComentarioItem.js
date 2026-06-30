const { DataTypes } = require("sequelize");
const { sequelize } = require("../../db");

const ComentarioItem = sequelize.define("ComentarioItem", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  texto: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  itemId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  autorTipo: {
    type: DataTypes.ENUM("admin", "usuario"),
    allowNull: false,
    defaultValue: "admin",
  },
  autorId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
});

module.exports = ComentarioItem;
