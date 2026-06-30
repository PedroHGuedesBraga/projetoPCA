const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuarioController");
const authAdmin = require("../middleware/authAdmin");

/**
 * @swagger
 * components:
 *   schemas:
 *     Usuario:
 *       type: object
 *       required:
 *         - cpf
 *         - nome
 *         - email
 *         - senha
 *         - cargo
 *         - secretariaId
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         cpf:
 *           type: string
 *           example: "98765432100"
 *         nome:
 *           type: string
 *           example: "Maria Oliveira"
 *         email:
 *           type: string
 *           example: "maria@educacao.gov.br"
 *         senha:
 *           type: string
 *           example: "senhaSegura123"
 *         cargo:
 *           type: string
 *           enum: ["gerente", "usuario"]
 *           example: "usuario"
 *         secretariaId:
 *           type: string
 *           format: uuid
 *           example: "e7b4f3c1-5a23-4b92-a43a-8fd431a86b12"
 */

/**
 * @swagger
 * tags:
 *   name: Usuario
 *   description: Endpoints para gerenciamento e autenticação de usuários
 */

/**
 * @swagger
 * /api/usuario:
 *   post:
 *     summary: Cria um novo usuário
 *     tags: [Usuario]
 *     security:
 *       - jwt_auth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Usuario'
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Erro ao criar usuário
 */
router.post("/", authAdmin, usuarioController.create);

/**
 * @swagger
 * /api/usuario/login:
 *   post:
 *     summary: Realiza login e retorna um token JWT
 *     tags: [Usuario]
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
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       401:
 *         description: Credenciais inválidas
 *       404:
 *         description: Usuário não encontrado
 */
router.post("/login", usuarioController.login);

/**
 * @swagger
 * /api/usuario:
 *   get:
 *     summary: Retorna todos os usuários
 *     tags: [Usuario]
 *     security:
 *       - jwt_auth: []
 *     responses:
 *       200:
 *         description: Lista de usuários retornada com sucesso
 */
router.get("/", usuarioController.getAll);

/**
 * @swagger
 * /api/usuario/{id}:
 *   get:
 *     summary: Retorna um usuário pelo ID
 *     tags: [Usuario]
 *     security:
 *       - jwt_auth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do usuário
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuário encontrado
 *       404:
 *         description: Usuário não encontrado
 */
router.get("/:id", usuarioController.getById);

/**
 * @swagger
 * /api/usuario/{id}:
 *   put:
 *     summary: Atualiza um usuário existente
 *     tags: [Usuario]
 *     security:
 *       - jwt_auth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do usuário
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Usuario'
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *       404:
 *         description: Usuário não encontrado
 */
router.put("/:id", usuarioController.update);

/**
 * @swagger
 * /api/usuario/{id}:
 *   delete:
 *     summary: Exclui um usuário
 *     tags: [Usuario]
 *     security:
 *       - jwt_auth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do usuário
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuário excluído com sucesso
 *       404:
 *         description: Usuário não encontrado
 */
router.delete("/:id", usuarioController.delete);

module.exports = router;
