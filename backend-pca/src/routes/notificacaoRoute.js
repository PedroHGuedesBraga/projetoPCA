const router = require("express").Router();
const ctrl = require("../controllers/notificacaoController");
const authUsuario = require("../middleware/authUsuario");
const authAdmin = require("../middleware/authAdmin");

// Usuário
router.get("/", authUsuario, ctrl.listar);
router.patch("/lidas-todas", authUsuario, ctrl.marcarTodasLidas);
router.patch("/:id/lida", authUsuario, ctrl.marcarLida);

// Admin
router.get("/admin", authAdmin, ctrl.listarAdmin);
router.patch("/admin/lidas-todas", authAdmin, ctrl.marcarTodasLidasAdmin);
router.patch("/admin/:id/lida", authAdmin, ctrl.marcarLidaAdmin);

module.exports = router;
