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
  valorContrato: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  dataInicioContrato:{
        type: DataTypes.DATE,
        allowNull: false,
    },
  dataTerminoContrato:{
        type: DataTypes.DATE,
        allowNull: false,
    },
  
});

module.exports = Empresa;
