const { DataTypes } = require("sequelize");
const { sequelize } = require("../../db");

const descontoEmpresa = sequelize.define("descontoEmpresa", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },

    empresaId: {
        type: DataTypes.UUID,
        allowNull: false,
    },

    motivoDesconto: {
        type: DataTypes.TEXT,
        allowNull: false,
    },

    valorDesconto: {
        type: DataTypes.DECIMAL(12,2),
        allowNull: false,
    },

    dataEnvio: {
        type: DataTypes.DATE,
        allowNull: false,
    },
});

module.exports = descontoEmpresa;
