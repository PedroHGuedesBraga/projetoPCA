const router = require("express").Router();
const itemController = require("../controllers/itemController");
const authAdmin = require("../middleware/authAdmin");
const authAny = require("../middleware/authAny");

/**
 * @swagger
 * components:
 *   schemas:
 *     Item:
 *       type: object
 *       required:
 *         - nome
 *         - descricao
 *         - quantidadeItem
 *         - precoUnitario
 *         - data
 *         - unidadeDeMedida
 *         - aprovado
 *         - contratoId
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         nome:
 *           type: string
 *           example: "Caneta Azul"
 *         descricao:
 *           type: string
 *           example: "Caneta esferográfica azul, corpo transparente"
 *         quantidadeItem:
 *           type: integer
 *           example: 100
 *         precoUnitario:
 *           type: number
 *           format: decimal
 *           example: 2.50
 *         data:
 *           type: string
 *           format: date
 *           example: "2025-02-15"
 *         unidadeDeMedida:
 *           type: string
 *           example: "unidade"
 *         aprovado:
 *           type: boolean
 *           example: true
 *         contratoId:
 *           type: string
 *           format: uuid
 *           example: "c4c8a13b-2a65-48c5-b9c2-ff7d8d903ea3"
 */

/**
 * @swagger
 * tags:
 *   name: Item
 *   description: Endpoints para gerenciamento de itens
 */

/**
 * @swagger
 * /api/item:
 *   post:
 *     summary: Cria um novo item
 *     tags: [Item]
 *     security:
 *       - jwt_auth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Item'
 *     responses:
 *       201:
 *         description: Item criado com sucesso
 *       400:
 *         description: Erro ao criar item
 */
router.post("/",authAny, itemController.create);

/**
 * @swagger
 * /api/item:
 *   get:
 *     summary: Retorna todos os itens
 *     tags: [Item]
 *     security:
 *       - jwt_auth: []
 *     responses:
 *       200:
 *         description: Lista de itens retornada com sucesso
 */
router.get("/", authAny, itemController.getAll);

/**
 * @swagger
 * /api/item/{id}:
 *   get:
 *     summary: Retorna um item pelo ID
 *     tags: [Item]
 *     security:
 *       - jwt_auth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do item
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Item encontrado
 *       404:
 *         description: Item não encontrado
 */
router.get("/:id", authAny, itemController.getById);

/**
 * @swagger
 * /api/item/{id}:
 *   put:
 *     summary: Atualiza um item existente
 *     tags: [Item]
 *     security:
 *       - jwt_auth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do item
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Item'
 *     responses:
 *       200:
 *         description: Item atualizado com sucesso
 *       404:
 *         description: Item não encontrado
 */
router.put("/:id", authAny, itemController.update);

/**
 * @swagger
 * /api/item/{id}:
 *   delete:
 *     summary: Exclui um item
 *     tags: [Item]
 *     security:
 *       - jwt_auth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do item
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Item excluído com sucesso
 *       404:
 *         description: Item não encontrado
 */
router.delete("/:id", itemController.delete);

router.patch("/:id/aprovado", authAdmin, itemController.toggleAprovado);
router.patch("/contrato/:contratoId/aprovar-todos", authAdmin, itemController.aprovarTodos);

// Comentários por item
const comentarioCtrl = require("../controllers/comentarioItemController");
router.get("/:itemId/comentarios", authAny, comentarioCtrl.listar);
router.post("/:itemId/comentarios", authAny, comentarioCtrl.criar);
router.delete("/comentarios/:id", authAny, comentarioCtrl.deletar);

module.exports = router;
