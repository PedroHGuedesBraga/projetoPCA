const Router = require('express').Router();

const secretariaRoute = require('./secretariaRoute');
const contratoRoute = require('./contratoRoute');
const itemRoute = require('./itemRoute');
const usuarioRoute = require('./usuarioRoute');
const adminRoute = require('./adminRoute');
const notificacaoRoute = require('./notificacaoRoute');
const planoAnualRoute = require('./planoAnualRoute');
const aprovadoRoute = require('./aprovadoRoute');
const empresaRoute = require('./empresaRoute');
const contratoEmpresaRoute = require('./contratoEmpresaRoute');
const descontoEmpresaRoute = require('./descontoEmpresaRoute');

Router.use('/descontoEmpresa', descontoEmpresaRoute);
Router.use('/contratoEmpresa', contratoEmpresaRoute);
Router.use('/empresa', empresaRoute);
Router.use('/aprovado', aprovadoRoute);
Router.use('/secretaria', secretariaRoute);
Router.use('/contrato', contratoRoute);
Router.use('/item', itemRoute);
Router.use('/usuario', usuarioRoute);
Router.use('/admin', adminRoute);
Router.use('/notificacoes', notificacaoRoute);
Router.use('/plano-anual', planoAnualRoute);

module.exports = Router;