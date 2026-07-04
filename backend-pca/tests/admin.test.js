const request = require('supertest');
const app = require('../index');
const {
  sequelize,
  connectDB,
  syncDatabase,
  createInitialAdmin
} = require('../db');

const { Admin } = require('../src/models/associations');

describe('Testes de Integração - CRUD /admin', () => {
  let adminToken = '';
  let adminIdCriado = null;

  beforeAll(async () => {
    await connectDB();
    await syncDatabase();
    await createInitialAdmin();

    // Remove todos os admins exceto o super admin inicial
    await Admin.destroy({
      where: {
        email: {
          [require('sequelize').Op.ne]: process.env.ADMIN_EMAIL
        }
      }
    });

    const loginResponse = await request(app)
      .post('/api/admin/login')
      .send({
        cpf: process.env.ADMIN_CPF,
        senha: process.env.ADMIN_PASSWORD
      });

    adminToken = loginResponse.body.token;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  // ============================
  // CREATE
  // ============================

  it('POST /api/admin - Deve criar um novo admin', async () => {
    const response = await request(app)
      .post('/api/admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nome: 'Administrador Teste',
        email: 'admin.teste@sistema.com',
        cpf: '99999999999',
        senha: 'SenhaSegura123'
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('admin');
    expect(response.body).toHaveProperty('token');

    expect(response.body.admin.nome).toBe('Administrador Teste');
    expect(response.body.admin.email).toBe('admin.teste@sistema.com');

    // Confirma que a senha não veio como texto puro
    expect(response.body.admin.senha).not.toBe('SenhaSegura123');

    adminIdCriado = response.body.admin.id;
  });

  it('POST /api/api/admin - Não deve permitir email duplicado', async () => {
    const response = await request(app)
      .post('/api/admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nome: 'Outro Admin',
        email: 'admin.teste@sistema.com',
        cpf: '88888888888',
        senha: 'OutraSenha123'
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Email já cadastrado');
  });

  // ============================
  // READ
  // ============================

  it('GET /api/admin - Deve listar todos os admins', async () => {
    const response = await request(app)
      .get('/api/admin')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/admin/:id - Deve buscar um admin pelo ID', async () => {
    const response = await request(app)
      .get(`/api/admin/${adminIdCriado}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.id).toBe(adminIdCriado);
    expect(response.body.email).toBe('admin.teste@sistema.com');
  });

  // ============================
  // UPDATE
  // ============================

  it('PUT /api/admin/:id - Deve atualizar um admin', async () => {
    const response = await request(app)
      .put(`/api/admin/${adminIdCriado}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nome: 'Administrador Atualizado',
        email: 'admin.atualizado@sistema.com'
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.nome).toBe('Administrador Atualizado');
    expect(response.body.email).toBe('admin.atualizado@sistema.com');
  });

  // ============================
  // DELETE
  // ============================

  it('DELETE /api/admin/:id - Deve remover o admin', async () => {
    const response = await request(app)
      .delete(`/api/admin/${adminIdCriado}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Admin deletado com sucesso');

    const getResponse = await request(app)
      .get(`/api/admin/${adminIdCriado}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(getResponse.statusCode).toBe(404);
  });
});