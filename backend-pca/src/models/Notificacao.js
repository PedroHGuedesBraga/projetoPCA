const { DataTypes } = require("sequelize");
const { sequelize } = require("../../db");

const Notificacao = sequelize.define("Notificacao", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  texto: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tipo: {
    type: DataTypes.STRING, // "item_aprovado" | "comentario"
    allowNull: false,
  },
  referenciaId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  itemId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  secretariaId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  lida: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  usuarioId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  adminId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
});

module.exports = Notificacao;
