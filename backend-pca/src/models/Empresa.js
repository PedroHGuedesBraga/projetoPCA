const { DataTypes } = require("sequelize");
const { sequelize } = require("../../db");

const Empresa = sequelize.define("Empresa", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  cnpj: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Empresa;
