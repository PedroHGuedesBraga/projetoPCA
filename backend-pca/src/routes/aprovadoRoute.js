const express = require("express");
const router = express.Router();
const aprovadoController = require("../controllers/aprovadoController");
const upload = require("../middleware/upload");
const authAdmin = require("../middleware/authAdmin");
// Quando bater o POST, o multer salva o arquivo no disco primeiro usando a chave "documento" do front
router.post(
    "/",
    upload.single("documento"), // Nome do campo enviado no FormData pelo Front-end
    authAdmin,
    aprovadoController.create
);

router.get("/", authAdmin, aprovadoController.getAll);
router.get("/:id", authAdmin, aprovadoController.getById);

// Quando bater aqui, baixa o arquivo
router.get("/documento/:id", authAdmin, aprovadoController.baixarDocumento);

module.exports = router;