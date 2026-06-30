const { DataTypes } = require("sequelize");
const { sequelize } = require("../../db");
const Secretaria = require("./Secretaria");

const Usuario = sequelize.define("Usuario", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  cpf: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  senha: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cargo: {
    type: DataTypes.ENUM("gerente", "usuario"),
    allowNull: false,
  },
});

// Relacionamento com Secretaria
Usuario.belongsTo(Secretaria, { foreignKey: "secretariaId", onDelete: "CASCADE" });
Secretaria.hasMany(Usuario, { foreignKey: "secretariaId" });

module.exports = Usuario;
