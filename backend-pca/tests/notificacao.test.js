const request = require("supertest");
const app = require("../index");

const {
  sequelize,
  connectDB,
  syncDatabase,
  createInitialAdmin,
} = require("../db");

const {
  Notificacao,
} = require("../src/models/associations");

describe("Testes de Integração - Notificações Admin (/api/notificacao/admin)", () => {
  let adminToken;
  let adminId;
  let notificacaoId;

  beforeAll(async () => {
    await connectDB();
    await syncDatabase();
    await createInitialAdmin();

    // Login do admin
    const loginResponse = await request(app)
      .post("/api/admin/login")
      .send({
        cpf: process.env.ADMIN_CPF,
        senha: process.env.ADMIN_PASSWORD,
      });

    adminToken = loginResponse.body.token;
    adminId = loginResponse.body.admin.id;

    await Notificacao.destroy({
      where: { adminId },
    });

    const notificacao = await Notificacao.create({
      adminId,
      texto: "Notificação de teste",
      tipo: "teste",
      lida: false,
    });

    notificacaoId = notificacao.id;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  // =====================
  // LISTAR
  // =====================

  it("GET /api/notificacoes/admin - Deve listar notificações do admin", async () => {
    const response = await request(app)
      .get("/api/notificacoes/admin")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(1);
  });

  // =====================
  // MARCAR UMA COMO LIDA
  // =====================

  it("PATCH /api/notificacoes/admin/:id/lida - Deve marcar uma notificação como lida", async () => {
    const response = await request(app)
      .patch(`/api/notificacoes/admin/${notificacaoId}/lida`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.lida).toBe(true);
  });

  // =====================
  // MARCAR TODAS COMO LIDAS
  // =====================

  it("PATCH /api/notificacoes/admin/lidas-todas - Deve marcar todas as notificações como lidas", async () => {
    // Cria outra notificação não lida
    await Notificacao.create({
      adminId,
      texto: "Outra notificação",
      tipo: "teste",
      lida: false,
    });

    const response = await request(app)
      .patch("/api/notificacoes/admin/lidas-todas")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe(
      "Todas as notificações marcadas como lidas"
    );

    const restantes = await Notificacao.count({
      where: {
        adminId,
        lida: false,
      },
    });

    expect(restantes).toBe(0);
  });
});