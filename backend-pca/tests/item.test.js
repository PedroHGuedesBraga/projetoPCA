const request = require("supertest");
const app = require("../index");

const {
  sequelize,
  connectDB,
  syncDatabase,
  createInitialAdmin,
} = require("../db");

const {
  Item,
  Contrato,
  Secretaria,
} = require("../src/models/associations");

describe("Testes de Integração - CRUD /api/item", () => {
  let adminToken = "";
  let itemId = null;
  let contratoId = null;
  let secretariaId = null;

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

    // Cria secretaria
    const secretaria = await Secretaria.create({
      nome: "Secretaria Teste",
    });

    secretariaId = secretaria.id;

    // Cria contrato
    const contrato = await Contrato.create({
      nome: "Contrato Teste",
      data: "2025-08-01",
      status: "rascunho",
      aprovado: false,
      itensQuantidade: 0,
      secretariaId,
      codigoRastreio: "TES-2025-0001",
    });

    contratoId = contrato.id;

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

  // =====================
  // CREATE
  // =====================

  it("POST /api/item - Deve criar um item", async () => {
    const response = await request(app)
      .post("/api/item")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        nome: "Notebook",
        descricao: "Notebook Dell",
        quantidadeItem: 10,
        precoUnitario: 4500,
        data: "2025-08-10",
        unidadeDeMedida: "UN",
        aprovado: false,
        contratoId,
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.nome).toBe("Notebook");
    expect(response.body.contratoId).toBe(contratoId);

    itemId = response.body.id;
  });

  it("POST /api/item - Deve rejeitar item sem contrato", async () => {
    const response = await request(app)
      .post("/api/item")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        nome: "Mouse",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("contratoId é obrigatório");
  });

  // =====================
  // READ
  // =====================

  it("GET /api/item - Deve listar todos os itens", async () => {
    const response = await request(app)
      .get("/api/item")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(1);
  });

  it("GET /api/item/:id - Deve buscar item pelo ID", async () => {
    const response = await request(app)
      .get(`/api/item/${itemId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.id).toBe(itemId);
    expect(response.body.nome).toBe("Notebook");
  });

  // =====================
  // UPDATE
  // =====================

  it("PUT /api/item/:id - Deve atualizar item", async () => {
    const response = await request(app)
      .put(`/api/item/${itemId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        nome: "Notebook Lenovo",
        quantidadeItem: 20,
        precoUnitario: 5000,
        aprovado: true,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.nome).toBe("Notebook Lenovo");
    expect(response.body.quantidadeItem).toBe(20);
    expect(response.body.precoUnitario).toBe(5000);
    expect(response.body.aprovado).toBe(true);
  });

  // =====================
  // DELETE
  // =====================

  it("DELETE /api/item/:id - Deve remover item", async () => {
    const response = await request(app)
      .delete(`/api/item/${itemId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Item deletado com sucesso");

    const getResponse = await request(app)
      .get(`/api/item/${itemId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(getResponse.statusCode).toBe(404);
  });
});