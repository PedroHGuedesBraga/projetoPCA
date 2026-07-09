const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const loginLimiter = require("../middleware/rateLimit");
const authAdmin = require("../middleware/authAdmin");

/**
 * @swagger
 * components:
 *   schemas:
 *     Admin:
 *       type: object
 *       required:
 *         - cpf
 *         - nome
 *         - email
 *         - senha
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "b7b1c3c2-7b55-4a58-93b9-b9e7c1d49aaf"
 *         cpf:
 *           type: string
 *           example: "12345678900"
 *         nome:
 *           type: string
 *           example: "João da Silva"
 *         email:
 *           type: string
 *           example: "joao@empresa.com"
 *         senha:
 *           type: string
 *           example: "senha123"
 *         cargo:
 *           type: string
 *           default: "admin"
 *           example: "admin"
 */

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Endpoints para gerenciamento e autenticação de administradores
 */

/**
 * @swagger
 * /api/admin:
 *   post:
 *     summary: Cria um novo administrador
 *     tags: [Admin]
 *     security:
 *       - jwt_auth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Admin'
 *     responses:
 *       201:
 *         description: Administrador criado com sucesso
 *       400:
 *         description: Erro ao criar administrador
 */
router.post("/",authAdmin, adminController.create);

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: Realiza login de administrador e retorna um token JWT
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@exemplo.com
 *               senha:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             example:
 *               message: "Login bem-sucedido"
 *               token: "<jwt-token>"
 *       401:
 *         description: Credenciais inválidas
 *       404:
 *         description: Administrador não encontrado
 */
router.post("/login", loginLimiter, adminController.login);

/**
 * @swagger
 * /api/admin:
 *   get:
 *     summary: Retorna todos os administradores
 *     tags: [Admin]
 *     security:
 *       - jwt_auth: []
 *     responses:
 *       200:
 *         description: Lista de administradores retornada com sucesso
 */
router.get("/",authAdmin,adminController.getAll);

/**
 * @swagger
 * /api/admin/{id}:
 *   get:
 *     summary: Retorna um administrador pelo ID
 *     tags: [Admin]
 *     security:
 *       - jwt_auth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do administrador
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Administrador encontrado
 *       404:
 *         description: Administrador não encontrado
 */
router.get("/:id",authAdmin,adminController.getById);

/**
 * @swagger
 * /api/admin/{id}:
 *   put:
 *     summary: Atualiza um administrador existente
 *     tags: [Admin]
 *     security:
 *       - jwt_auth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do administrador
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Admin'
 *     responses:
 *       200:
 *         description: Administrador atualizado com sucesso
 *       404:
 *         description: Administrador não encontrado
 */
router.put("/:id", authAdmin, adminController.update);

/**
 * @swagger
 * /api/admin/{id}:
 *   delete:
 *     summary: Exclui um administrador
 *     tags: [Admin]
 *     security:
 *       - jwt_auth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do administrador
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Administrador excluído com sucesso
 *       404:
 *         description: Administrador não encontrado
 */
router.delete("/:id",authAdmin, adminController.delete);

module.exports = router;
