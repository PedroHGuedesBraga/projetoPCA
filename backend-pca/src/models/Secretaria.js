const { DataTypes } = require("sequelize");
const { sequelize } = require("../../db");

const Secretaria = sequelize.define("Secretaria", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Secretaria;
