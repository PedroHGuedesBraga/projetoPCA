const Secretaria = require("./Secretaria");
const Contrato = require("./Contrato");
const Item = require("./Item");
const ComentarioItem = require("./ComentarioItem");
const Notificacao = require("./Notificacao");
const Usuario = require("./Usuario");
const Admin = require("./Admin");
const Empresa = require("./Empresa")
const descontoEmpresa = require("./DescontoEmpresa");

// Empresa -> DescontoEmpresa
Empresa.hasMany(descontoEmpresa, {
    foreignKey: "empresaId",
    as: "descontos",
    onDelete: "CASCADE",
});

descontoEmpresa.belongsTo(Empresa, {
    foreignKey: "empresaId",
    as: "empresa",
});

// Secretaria -> Contrato
Secretaria.hasMany(Contrato, {
  foreignKey: "secretariaId",
  onDelete: "CASCADE",
  as: "contratos",
});
Contrato.belongsTo(Secretaria, {
  foreignKey: "secretariaId",
  as: "secretaria",
});

// Contrato -> Item
Contrato.hasMany(Item, {
  foreignKey: "contratoId",
  onDelete: "CASCADE",
});
Item.belongsTo(Contrato, {
  foreignKey: "contratoId",
});

// Item -> ComentarioItem
Item.hasMany(ComentarioItem, {
  foreignKey: "itemId",
  onDelete: "CASCADE",
});
ComentarioItem.belongsTo(Item, {
  foreignKey: "itemId",
});

Secretaria.hasMany(Usuario, { foreignKey: "secretariaId", onDelete: "SET NULL" });
Usuario.belongsTo(Secretaria, { foreignKey: "secretariaId" });

// Usuario -> Notificacao
Usuario.hasMany(Notificacao, { foreignKey: "usuarioId", onDelete: "CASCADE" });
Notificacao.belongsTo(Usuario, { foreignKey: "usuarioId" });

module.exports = { Secretaria, Contrato, Item, ComentarioItem, Notificacao, Usuario, Admin, Empresa, descontoEmpresa };
