const request = require("supertest");
const app = require("../index");

const {
  sequelize,
  connectDB,
  syncDatabase,
  createInitialAdmin,
} = require("../db");

const {
  Secretaria,
  Contrato,
  Item,
} = require("../src/models/associations");

describe("Testes de Integração - GET /api/plano-anual/:ano", () => {
  let adminToken = "";
  const ano = 2025;

  beforeAll(async () => {
    await connectDB();
    await syncDatabase();
    await createInitialAdmin();

    await Item.destroy({
      where: {},
      truncate: { cascade: true },
    });

    await Contrato.destroy({
      where: {},
      truncate: { cascade: true },
    });

    await Secretaria.destroy({
      where: {},
      truncate: { cascade: true },
    });

    // Secretaria
    const secretaria = await Secretaria.create({
      nome: "Secretaria de Educação",
    });

    // Contrato
    const contrato = await Contrato.create({
      nome: "Contrato Escolar",
      data: `${ano}-05-15`,
      status: "rascunho",
      aprovado: false,
      itensQuantidade: 1,
      secretariaId: secretaria.id,
      codigoRastreio: "TES-2025-0001",
    });

    // Item
    await Item.create({
      nome: "Notebook",
      descricao: "Notebook para escolas",
      quantidadeItem: 20,
      precoUnitario: 3500,
      unidadeDeMedida: "UN",
      data: `${ano}-05-15`,
      aprovado: false,
      contratoId: contrato.id,
    });

    // Login admin
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

  it("GET /api/plano-anual/:ano - Deve retornar o plano anual do ano informado", async () => {
    const response = await request(app)
      .get(`/api/plano-anual/${ano}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);

    expect(response.body[0]).toHaveProperty("nome");
    expect(response.body[0]).toHaveProperty("contratos");

    expect(Array.isArray(response.body[0].contratos)).toBe(true);
    expect(response.body[0].contratos.length).toBeGreaterThan(0);

    expect(response.body[0].contratos[0].nome).toBe("Contrato Escolar");
    expect(response.body[0].contratos[0]).toHaveProperty("Items");

    expect(Array.isArray(response.body[0].contratos[0].Items)).toBe(true);
    expect(response.body[0].contratos[0].Items.length).toBe(1);

    expect(response.body[0].contratos[0].Items[0].nome).toBe("Notebook");
  });

  it("GET /api/plano-anual/:ano - Deve retornar um array vazio para ano sem contratos", async () => {
    const response = await request(app)
      .get("/api/plano-anual/2035")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(0);
  });
});