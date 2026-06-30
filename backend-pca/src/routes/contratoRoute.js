const router = require("express").Router();
const contratoController = require("../controllers/contratoController");


/**
 * @swagger
 * components:
 *   schemas:
 *     Contrato:
 *       type: object
 *       required:
 *         - nome
 *         - data
 *         - status
 *         - aprovado
 *         - itensQuantidade
 *         - secretariaId
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         nome:
 *           type: string
 *           example: "Contrato de Fornecimento 2025"
 *         data:
 *           type: string
 *           format: date
 *           example: "2025-01-10"
 *         status:
 *           type: string
 *           example: "ativo"
 *         aprovado:
 *           type: boolean
 *           example: true
 *         itensQuantidade:
 *           type: integer
 *           example: 5
 *         secretariaId:
 *           type: string
 *           format: uuid
 *           example: "f9b7d9a2-2d8e-4b8f-96f0-1a3c5d76b3ff"
 */

/**
 * @swagger
 * tags:
 *   name: Contrato
 *   description: Endpoints para gerenciamento de contratos
 */

/**
 * @swagger
 * /api/contrato:
 *   post:
 *     summary: Cria um novo contrato
 *     tags: [Contrato]
 *     security:
 *       - jwt_auth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Contrato'
 *     responses:
 *       201:
 *         description: Contrato criado com sucesso
 *       400:
 *         description: Erro ao criar contrato
 */
router.post("/", contratoController.create);

/**
 * @swagger
 * /api/contrato:
 *   get:
 *     summary: Retorna todos os contratos
 *     tags: [Contrato]
 *     security:
 *       - jwt_auth: []
 *     responses:
 *       200:
 *         description: Lista de contratos retornada com sucesso
 */
router.get("/", contratoController.getAll);

/**
 * @swagger
 * /api/contrato/{id}:
 *   get:
 *     summary: Retorna um contrato pelo ID
 *     tags: [Contrato]
 *     security:
 *       - jwt_auth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do contrato
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Contrato encontrado
 *       404:
 *         description: Contrato não encontrado
 */
router.get("/:id", contratoController.getById);

/**
 * @swagger
 * /api/contrato/{id}:
 *   put:
 *     summary: Atualiza um contrato existente
 *     tags: [Contrato]
 *     security:
 *       - jwt_auth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do contrato
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Contrato'
 *     responses:
 *       200:
 *         description: Contrato atualizado com sucesso
 *       404:
 *         description: Contrato não encontrado
 */
router.put("/:id", contratoController.update);

/**
 * @swagger
 * /api/contrato/{id}:
 *   delete:
 *     summary: Exclui um contrato
 *     tags: [Contrato]
 *     security:
 *       - jwt_auth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do contrato
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Contrato excluído com sucesso
 *       404:
 *         description: Contrato não encontrado
 */
router.delete("/:id", contratoController.delete);
router.post("/clonar-ano", contratoController.clonarAno);
router.get("/:id/itens", contratoController.getItensByContrato);
router.patch("/:id/mudar-mes", contratoController.mudarMes);

module.exports = router;
