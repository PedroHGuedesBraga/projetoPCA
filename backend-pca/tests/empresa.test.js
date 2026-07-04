const request = require("supertest");
const app = require("../index");

const {
  sequelize,
  connectDB,
  syncDatabase,
  createInitialAdmin,
} = require("../db");

const { Empresa } = require("../src/models/associations");

describe("Testes de Integração - Empresa (/api/empresa)", () => {
  let adminToken;
  let empresaId;

  beforeAll(async () => {
    await connectDB();
    await syncDatabase();
    await createInitialAdmin();

    await Empresa.destroy({ where: {}, truncate: { cascade: true } });

    const login = await request(app)
      .post("/api/admin/login")
      .send({
        cpf: process.env.ADMIN_CPF,
        senha: process.env.ADMIN_PASSWORD,
      });

    adminToken = login.body.token;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  // =====================
  // CREATE
  // =====================

  it("POST /empresa - Deve criar empresa", async () => {
    const response = await request(app)
      .post("/api/empresa")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        cnpj: "12.345.678/0001-99",
        nome: "Empresa Teste",
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.nome).toBe("Empresa Teste");

    empresaId = response.body.id;
  });

  it("POST /empresa - Deve rejeitar CNPJ duplicado", async () => {
    const response = await request(app)
      .post("/api/empresa")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        cnpj: "12.345.678/0001-99",
        nome: "Outra Empresa",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("CNPJ já cadastrado.");
  });

  // =====================
  // READ ALL
  // =====================

  it("GET /empresa - Deve listar empresas", async () => {
    const response = await request(app)
      .get("/api/empresa")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  // =====================
  // GET BY ID
  // =====================

  it("GET /empresa/:id - Deve buscar empresa por ID", async () => {
    const response = await request(app)
      .get(`/api/empresa/${empresaId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.id).toBe(empresaId);
    expect(response.body.nome).toBe("Empresa Teste");
  });
});