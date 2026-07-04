const request = require("supertest");
const app = require("../index");

const {
  sequelize,
  connectDB,
  syncDatabase,
  createInitialAdmin,
} = require("../db");

const { Secretaria } = require("../src/models/associations");

describe("Testes de Integração - CRUD /api/secretaria", () => {
  let adminToken = "";
  let secretariaId = null;

  beforeAll(async () => {
    await connectDB();
    await syncDatabase();
    await createInitialAdmin();

    // Limpa as secretarias
    await Secretaria.destroy({
      where: {},
      truncate: { cascade: true },
    });

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

  it("POST /api/secretaria - Deve criar uma secretaria", async () => {
    const response = await request(app)
      .post("/api/secretaria")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        nome: "Secretaria de Educação",
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.nome).toBe("Secretaria de Educação");

    secretariaId = response.body.id;
  });

  // =====================
  // READ
  // =====================

  it("GET /api/secretaria - Deve listar todas as secretarias", async () => {
    const response = await request(app)
      .get("/api/secretaria")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(1);
  });

  it("GET /api/secretaria/:id - Deve buscar uma secretaria pelo ID", async () => {
    const response = await request(app)
      .get(`/api/secretaria/${secretariaId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.id).toBe(secretariaId);
    expect(response.body.nome).toBe("Secretaria de Educação");
  });

  // =====================
  // UPDATE
  // =====================

  it("PUT /api/secretaria/:id - Deve atualizar a secretaria", async () => {
    const response = await request(app)
      .put(`/api/secretaria/${secretariaId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        nome: "Secretaria de Saúde",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.nome).toBe("Secretaria de Saúde");
  });

  // =====================
  // DELETE
  // =====================

  it("DELETE /api/secretaria/:id - Deve remover a secretaria", async () => {
    const response = await request(app)
      .delete(`/api/secretaria/${secretariaId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe(
      "Secretaria deletada com sucesso"
    );

    const getResponse = await request(app)
      .get(`/api/secretaria/${secretariaId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(getResponse.statusCode).toBe(404);
  });
});