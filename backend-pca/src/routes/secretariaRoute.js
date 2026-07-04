const express = require("express");
const router = express.Router();
const secretariaController = require("../controllers/secretariaController");
const authAny = require("../middleware/authAny");
const authAdmin = require("../middleware/authAdmin");
/**
 * @swagger
 * components:
 *   schemas:
 *     Secretaria:
 *       type: object
 *       required:
 *         - nome
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         nome:
 *           type: string
 *           example: "Secretaria de Educação"
 */

/**
 * @swagger
 * tags:
 *   name: Secretaria
 *   description: Endpoints para gerenciamento de secretarias
 */

/**
 * @swagger
 * /api/secretaria:
 *   post:
 *     summary: Cria uma nova secretaria
 *     tags: [Secretaria]
 *     security:
 *       - jwt_auth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Secretaria'
 *     responses:
 *       201:
 *         description: Secretaria criada com sucesso
 *       400:
 *         description: Erro ao criar secretaria
 */
router.post("/", authAdmin, secretariaController.create);

/**
 * @swagger
 * /api/secretaria:
 *   get:
 *     summary: Retorna todas as secretarias
 *     tags: [Secretaria]
 *     security:
 *       - jwt_auth: []
 *     responses:
 *       200:
 *         description: Lista de secretarias retornada com sucesso
 */
router.get("/", authAny, secretariaController.getAll);

/**
 * @swagger
 * /api/secretaria/{id}:
 *   get:
 *     summary: Retorna uma secretaria pelo ID
 *     tags: [Secretaria]
 *     security:
 *       - jwt_auth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da secretaria
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Secretaria encontrada
 *       404:
 *         description: Secretaria não encontrada
 */
router.get("/:id", authAny, secretariaController.getById);

/**
 * @swagger
 * /api/secretaria/{id}/contratos-organizados:
 *   get:
 *     summary: Retorna contratos organizados de uma secretaria
 *     tags: [Secretaria]
 *     security:
 *       - jwt_auth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da secretaria
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Contratos retornados com sucesso
 */
router.get("/:id/contratos-organizados", authAdmin, secretariaController.getContratosOrganizados);

/**
 * @swagger
 * /api/secretaria/{id}:
 *   put:
 *     summary: Atualiza uma secretaria existente
 *     tags: [Secretaria]
 *     security:
 *       - jwt_auth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da secretaria
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Secretaria'
 *     responses:
 *       200:
 *         description: Secretaria atualizada com sucesso
 *       404:
 *         description: Secretaria não encontrada
 */
router.put("/:id", authAdmin, secretariaController.update);

/**
 * @swagger
 * /api/secretaria/{id}:
 *   delete:
 *     summary: Exclui uma secretaria
 *     tags: [Secretaria]
 *     security:
 *       - jwt_auth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da secretaria
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Secretaria excluída com sucesso
 *       404:
 *         description: Secretaria não encontrada
 */
router.delete("/:id", authAdmin, secretariaController.delete);

module.exports = router;
