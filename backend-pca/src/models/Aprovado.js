const { DataTypes } = require("sequelize");
const { sequelize } = require("../../db");

const Aprovado = sequelize.define("Aprovado",{
    id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
    nomeEmpresa:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    dataContrato:{
        type: DataTypes.DATE,
        allowNull: false,
    },
    documentoPath:{
        type: DataTypes.STRING,
        allowNull: false,
    }
})
module.exports = { Aprovado };