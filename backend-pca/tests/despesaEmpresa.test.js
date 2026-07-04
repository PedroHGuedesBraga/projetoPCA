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
  descontoEmpresa,
} = require("../src/models/associations");

describe("Testes - Desconto Empresa (/api/descontoEmpresa)", () => {
  let adminToken;
  let empresaId;
  let contratoId;
  let descontoId;

  // =====================
  // BEFORE ALL (RESET LIMPO)
  // =====================
  beforeAll(async () => {
    await connectDB();

    // 🔥 reset total (evita FK error)
    await sequelize.sync({ force: true });

    await createInitialAdmin();

    // login admin
    const login = await request(app)
      .post("/api/admin/login")
      .send({
        cpf: process.env.ADMIN_CPF,
        senha: process.env.ADMIN_PASSWORD,
      });

    adminToken = login.body.token;

    // cria empresa
    const empresa = await Empresa.create({
      cnpj: "11.111.111/0001-11",
      nome: "Empresa Teste",
    });

    empresaId = empresa.id;

    // cria contrato
    const contrato = await contratoEmpresa.create({
      empresaId,
      nomeContrato: "Contrato Teste",
      valorContrato: 10000,
      dataInicioContrato: "2026-01-01",
      dataTerminoContrato: "2026-12-31",
    });

    contratoId = contrato.id;
  });

  // =====================
  // AFTER ALL
  // =====================
  afterAll(async () => {
    await sequelize.close();
  });

  // =====================
  // TESTE 1 - CREATE
  // =====================
  it("POST /descontoEmpresa - deve criar desconto corretamente", async () => {
    const response = await request(app)
      .post("/api/descontoEmpresa")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        contratoEmpresaId: contratoId,
        motivoDesconto: "Teste de desconto",
        valorDesconto: 150.5,
        dataEnvio: "2026-01-10",
      });

    expect(response.statusCode).toBe(201);

    expect(response.body).toHaveProperty("id");
    expect(response.body.contratoEmpresaId).toBe(contratoId);
    expect(response.body.motivoDesconto).toBe("Teste de desconto");
    expect(parseFloat(response.body.valorDesconto)).toBe(150.5);
    expect(response.body.dataEnvio).toContain("2026-01-10");

    descontoId = response.body.id;
  });

  // =====================
  // TESTE 2 - GET ALL + REGRA DE NEGÓCIO
  // =====================
  it("GET /descontoEmpresa/:contratoEmpresaId - deve listar descontos e calcular total", async () => {
    // cria mais um desconto
    await request(app)
      .post("/api/descontoEmpresa")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        contratoEmpresaId: contratoId,
        motivoDesconto: "Segundo desconto",
        valorDesconto: 200,
        dataEnvio: "2026-01-11",
      });

    const response = await request(app)
      .get(`/api/descontoEmpresa/${contratoId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);

    expect(response.body.contratoEmpresaId).toBe(contratoId);

    // total de registros
    expect(response.body.totalDescontos).toBeGreaterThanOrEqual(2);

    // valida estrutura
    expect(Array.isArray(response.body.descontos)).toBe(true);

    // valida soma
    const somaManual = response.body.descontos.reduce(
      (acc, d) => acc + d.valor,
      0
    );

    expect(response.body.valorTotalDescontos).toBe(somaManual);
  });
});