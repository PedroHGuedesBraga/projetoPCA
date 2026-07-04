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
  ComentarioItem,
} = require("../src/models/associations");

describe("Testes de Integração - Comentários Item (/api/comentario-item)", () => {
  let adminToken;
  let itemId;
  let comentarioId;

  beforeAll(async () => {
    await connectDB();
    await syncDatabase();
    await createInitialAdmin();

    await ComentarioItem.destroy({ where: {}, truncate: { cascade: true } });
    await Item.destroy({ where: {}, truncate: { cascade: true } });
    await Contrato.destroy({ where: {}, truncate: { cascade: true } });
    await Secretaria.destroy({ where: {}, truncate: { cascade: true } });

    // login admin
    const login = await request(app)
      .post("/api/admin/login")
      .send({
        cpf: process.env.ADMIN_CPF,
        senha: process.env.ADMIN_PASSWORD,
      });

    adminToken = login.body.token;

    // estrutura base
    const secretaria = await Secretaria.create({
      nome: "Secretaria Teste",
    });

    const contrato = await Contrato.create({
      nome: "Contrato Teste",
      data: "2025-08-01",
      status: "rascunho",
      aprovado: false,
      itensQuantidade: 1,
      secretariaId: secretaria.id,
      codigoRastreio: "CT-2025-0001",
    });

    const item = await Item.create({
      nome: "Notebook",
      descricao: "Dell",
      quantidadeItem: 10,
      precoUnitario: 3000,
      data: "2025-08-01",
      unidadeDeMedida: "UN",
      aprovado: false,
      contratoId: contrato.id,
    });

    itemId = item.id;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it("POST - Deve criar comentário", async () => {
  const response = await request(app)
    .post(`/api/item/${itemId}/comentarios`)
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ texto: "Comentário de teste" });

  expect(response.statusCode).toBe(201);
  comentarioId = response.body.id;
});

it("GET - Deve listar comentários", async () => {
  const response = await request(app)
    .get(`/api/item/${itemId}/comentarios`)
    .set("Authorization", `Bearer ${adminToken}`);

  expect(response.statusCode).toBe(200);
});

it("DELETE - Deve deletar comentário", async () => {
  const response = await request(app)
    .delete(`/api/item/comentarios/${comentarioId}`)
    .set("Authorization", `Bearer ${adminToken}`);

  expect(response.statusCode).toBe(200);
});

});