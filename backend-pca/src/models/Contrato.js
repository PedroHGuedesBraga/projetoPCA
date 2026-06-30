const { DataTypes } = require("sequelize");
const { sequelize } = require("../../db");

const Contrato = sequelize.define("Contrato", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  data: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  aprovado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  itensQuantidade: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  secretariaId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  codigoRastreio: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  justificativa: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

module.exports = Contrato;
