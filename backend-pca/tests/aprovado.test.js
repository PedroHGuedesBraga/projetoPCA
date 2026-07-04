const request = require("supertest");
const path = require("path");
const fs = require("fs");

const app = require("../index");

const {
  sequelize,
  connectDB,
  createInitialAdmin,
} = require("../db");

describe("Testes - Aprovado (/api/aprovado)", () => {
  let adminToken;
  let aprovadoId;

  // =====================
  // BEFORE ALL
  // =====================
  beforeAll(async () => {
    await connectDB();
    await sequelize.sync({ force: true });

    await createInitialAdmin();

    const login = await request(app)
      .post("/api/admin/login")
      .send({
        cpf: process.env.ADMIN_CPF,
        senha: process.env.ADMIN_PASSWORD,
      });

    adminToken = login.body.token;
  });

  // =====================
  // AFTER ALL
  // =====================
  afterAll(async () => {
    await sequelize.close();
  });

  // =====================
  // CREATE (UPLOAD PDF MOCKADO)
  // =====================
  it("POST /aprovado - deve criar registro com PDF", async () => {
    const filePath = path.join(__dirname, "mock.pdf");

    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, "PDF MOCK");
    }

    const response = await request(app)
      .post("/api/aprovado")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("nomeEmpresa", "Empresa Teste")
      .field("dataContrato", "2026-01-01")
      .attach("documento", filePath); // 🔥 corrigido (era file)

    expect(response.statusCode).toBe(201);

    expect(response.body).toHaveProperty("id");
    expect(response.body.nomeEmpresa).toBe("Empresa Teste");

    aprovadoId = response.body.id;
  });

  // =====================
  // GET ALL
  // =====================
  it("GET /aprovado - deve listar registros", async () => {
    const response = await request(app)
      .get("/api/aprovado")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(1);
  });

  // =====================
  // GET BY ID
  // =====================
  it("GET /aprovado/:id - deve buscar por ID", async () => {
    const response = await request(app)
      .get(`/api/aprovado/${aprovadoId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("id", aprovadoId);
  });

  // =====================
  // DOWNLOAD DOCUMENTO
  // =====================
  it("GET /aprovado/documento/:id - deve baixar documento", async () => {
    const response = await request(app)
      .get(`/api/aprovado/documento/${aprovadoId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    // valida apenas sucesso real (mais estável)
    expect(response.statusCode).toBeGreaterThanOrEqual(200);
    expect(response.statusCode).toBeLessThan(400);
  });
});