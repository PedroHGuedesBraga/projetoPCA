const { DataTypes } = require("sequelize");
const { sequelize } = require("../../db");

const Item = sequelize.define("Item", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descricao: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  quantidadeItem: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  precoUnitario: {
    type: DataTypes.DECIMAL,
    allowNull: true,
    defaultValue: 0,
  },
  data: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  unidadeDeMedida: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  aprovado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  contratoId: {       // 🔹 chave estrangeira para Contrato
    type: DataTypes.UUID,
    allowNull: false,
  },
});

module.exports = Item;
