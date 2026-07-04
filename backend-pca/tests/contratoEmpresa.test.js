const request = require("supertest");
const app = require("../index");

const {
  sequelize,
  connectDB,
  syncDatabase,
  createInitialAdmin,
} = require("../db");

const {
  Empresa,
  contratoEmpresa,
} = require("../src/models/associations");

describe("Testes - Contrato Empresa (/api/contratoEmpresa)", () => {
  let adminToken;
  let empresaId;
  let contratoId;

  beforeAll(async () => {
  await connectDB();

  await sequelize.sync({ force: true }); // 🔥 limpa tudo corretamente

  await createInitialAdmin();

  const login = await request(app)
    .post("/api/admin/login")
    .send({
      cpf: process.env.ADMIN_CPF,
      senha: process.env.ADMIN_PASSWORD,
    });

  adminToken = login.body.token;

  const empresa = await Empresa.create({
    cnpj: "11.111.111/0001-11",
    nome: "Empresa Teste",
  });

  empresaId = empresa.id;
});

  afterAll(async () => {
    await sequelize.close();
  });

  // =====================
  // CREATE
  // =====================
  it("POST - deve criar contrato", async () => {
    const response = await request(app)
      .post("/api/contratoEmpresa")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        empresaId,
        nomeContrato: "Contrato Teste",
        valorContrato: 10000,
        dataInicioContrato: "2025-01-01",
        dataTerminoContrato: "2025-12-31",
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("id");

    contratoId = response.body.id;
  });

  // =====================
  // GET ALL
  // =====================
  it("GET - deve listar contratos da empresa", async () => {
    const response = await request(app)
      .get(`/api/contratoEmpresa/${empresaId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  // =====================
  // GET BY ID
  // =====================
  it("GET - deve buscar contrato por ID", async () => {
    const response = await request(app)
      .get(`/api/contratoEmpresa/contratoUnico/${contratoId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.id).toBe(contratoId);
  });
});