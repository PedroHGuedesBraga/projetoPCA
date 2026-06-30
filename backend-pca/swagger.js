const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API do Sistema PCA",
      version: "1.0.0",
      description: "Documentação dos endpoints da API Node + Express + Sequelize (Neon)",
    },
    servers: [
      { url: "/api" },
    ],

    components: {
      securitySchemes: {
        jwt_auth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Insira o token JWT no formato: Bearer <token>",
        },
      },
      schemas: {
        // 🧑‍💼 ADMIN
        Admin: {
          type: "object",
          required: ["cpf", "nome", "email", "senha"],
          properties: {
            id: { type: "string", format: "uuid" },
            cpf: { type: "string", example: "12345678900" },
            nome: { type: "string", example: "João da Silva" },
            email: { type: "string", example: "joao@empresa.com" },
            senha: { type: "string", example: "senha123" },
            cargo: { type: "string", example: "admin" },
          },
        },

        // 👤 USUARIO
        Usuario: {
          type: "object",
          required: ["cpf", "nome", "email", "senha", "cargo", "secretariaId"],
          properties: {
            id: { type: "string", format: "uuid" },
            cpf: { type: "string", example: "98765432100" },
            nome: { type: "string", example: "Maria Oliveira" },
            email: { type: "string", example: "maria@educacao.gov.br" },
            senha: { type: "string", example: "senhaSegura123" },
            cargo: {
              type: "string",
              enum: ["gerente", "usuario"],
              example: "usuario",
            },
            secretariaId: {
              type: "string",
              format: "uuid",
              example: "e7b4f3c1-5a23-4b92-a43a-8fd431a86b12",
            },
          },
        },

        // 🏛️ SECRETARIA
        Secretaria: {
          type: "object",
          required: ["nome"],
          properties: {
            id: { type: "string", format: "uuid" },
            nome: { type: "string", example: "Secretaria de Educação" },
          },
        },

        // 📄 CONTRATO
        Contrato: {
          type: "object",
          required: [
            "nome",
            "data",
            "status",
            "aprovado",
            "itensQuantidade",
            "secretariaId",
          ],
          properties: {
            id: { type: "string", format: "uuid" },
            nome: { type: "string", example: "Contrato de Fornecimento 2025" },
            data: { type: "string", format: "date", example: "2025-01-10" },
            status: { type: "string", example: "ativo" },
            aprovado: { type: "boolean", example: true },
            itensQuantidade: { type: "integer", example: 5 },
            secretariaId: {
              type: "string",
              format: "uuid",
              example: "f9b7d9a2-2d8e-4b8f-96f0-1a3c5d76b3ff",
            },
          },
        },

        // 📦 ITEM
        Item: {
          type: "object",
          required: [
            "nome",
            "descricao",
            "quantidadeItem",
            "precoUnitario",
            "data",
            "unidadeDeMedida",
            "aprovado",
            "contratoId",
          ],
          properties: {
            id: { type: "string", format: "uuid" },
            nome: { type: "string", example: "Caneta Azul" },
            descricao: {
              type: "string",
              example: "Caneta esferográfica azul, corpo transparente",
            },
            quantidadeItem: { type: "integer", example: 100 },
            precoUnitario: { type: "number", format: "decimal", example: 2.5 },
            data: { type: "string", format: "date", example: "2025-02-15" },
            unidadeDeMedida: { type: "string", example: "unidade" },
            aprovado: { type: "boolean", example: true },
            contratoId: {
              type: "string",
              format: "uuid",
              example: "c4c8a13b-2a65-48c5-b9c2-ff7d8d903ea3",
            },
          },
        },
      },
    },
  },

  // 🔍 Local dos arquivos de rota com as anotações JSDoc
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

function setupSwagger(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("📘 Swagger disponível em: http://localhost:3000/api-docs");
}

module.exports = setupSwagger;
