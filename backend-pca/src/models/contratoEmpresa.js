const { DataTypes } = require("sequelize");
const { sequelize } = require("../../db");

const contratoEmpresa = sequelize.define("contratoEmpresa", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  nomeContrato: {
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

module.exports = contratoEmpresa;
