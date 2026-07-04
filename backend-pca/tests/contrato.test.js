const request = require("supertest");
const app = require("../index");

const {
  sequelize,
  connectDB,
  syncDatabase,
  createInitialAdmin,
} = require("../db");

const {
  Contrato,
  Secretaria,
} = require("../src/models/associations");

describe("Testes de Integração - CRUD /api/contrato", () => {
  let adminToken = "";
  let contratoId = null;
  let secretariaId = null;

  beforeAll(async () => {
    await connectDB();
    await syncDatabase();
    await createInitialAdmin();

    await Contrato.destroy({
      where: {},
      truncate: { cascade: true },
    });

    await Secretaria.destroy({
      where: {},
      truncate: { cascade: true },
    });

    // Cria uma secretaria para relacionar ao contrato
    const secretaria = await Secretaria.create({
      nome: "Secretaria de Testes",
    });

    secretariaId = secretaria.id;

    // Login do admin
    const loginResponse = await request(app)
      .post("/api/admin/login")
      .send({
        cpf: process.env.ADMIN_CPF,
        senha: process.env.ADMIN_PASSWORD,
      });

    adminToken = loginResponse.body.token;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  // =====================
  // CREATE
  // =====================

  it("POST /api/contrato - Deve criar um contrato", async () => {
    const response = await request(app)
      .post("/api/contrato")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        nome: "Contrato Teste",
        data: "2025-08-15",
        status: "rascunho",
        aprovado: false,
        itensQuantidade: 0,
        secretariaId,
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.nome).toBe("Contrato Teste");
    expect(response.body.secretariaId).toBe(secretariaId);
    expect(response.body).toHaveProperty("codigoRastreio");

    contratoId = response.body.id;
  });

  it("POST /api/contrato - Deve rejeitar contrato sem secretaria", async () => {
    const response = await request(app)
      .post("/api/contrato")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        nome: "Contrato Inválido",
        data: "2025-08-15",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("secretariaId é obrigatório");
  });

  // =====================
  // READ
  // =====================

  it("GET /api/contrato - Deve listar todos os contratos", async () => {
    const response = await request(app)
      .get("/api/contrato")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(1);
  });

  it("GET /api/contrato/:id - Deve buscar contrato pelo ID", async () => {
    const response = await request(app)
      .get(`/api/contrato/${contratoId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.id).toBe(contratoId);
    expect(response.body.nome).toBe("Contrato Teste");
  });

  // =====================
  // UPDATE
  // =====================

  it("PUT /api/contrato/:id - Deve atualizar contrato", async () => {
    const response = await request(app)
      .put(`/api/contrato/${contratoId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        nome: "Contrato Atualizado",
        status: "ativo",
        aprovado: true,
        itensQuantidade: 15,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.nome).toBe("Contrato Atualizado");
    expect(response.body.status).toBe("ativo");
    expect(response.body.aprovado).toBe(true);
    expect(response.body.itensQuantidade).toBe(15);
  });

  // =====================
  // DELETE
  // =====================

  it("DELETE /api/contrato/:id - Deve remover contrato", async () => {
    const response = await request(app)
      .delete(`/api/contrato/${contratoId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Contrato deletado com sucesso");

    const getResponse = await request(app)
      .get(`/api/contrato/${contratoId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(getResponse.statusCode).toBe(404);
  });
});