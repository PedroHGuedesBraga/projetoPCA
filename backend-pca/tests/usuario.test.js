const request = require('supertest');
const app = require('../index'); // Aponta para o seu arquivo index.js atualizado
const { sequelize, connectDB, syncDatabase, createInitialAdmin } = require('../db');
const { Usuario } = require('../src/models/associations'); // Ajuste o caminho se necessário

describe('Testes de Integração - CRUD /api/usuario', () => {
  let adminToken = '';
  let userIdCriado = null;

  beforeAll(async () => {
    // Inicializa o banco de dados de forma controlada para o teste
    await connectDB();
    await syncDatabase();
    await createInitialAdmin(); // Garante que o Super Admin padrão exista no banco de testes

    // Limpa a tabela para começar o CRUD do zero
    await Usuario.destroy({ where: {}, truncate: { cascade: true } });

    // Faz o login real usando a senha que está no seu process.env
    const loginResponse = await request(app)
      .post('/api/admin/login') // Lembra de checar se a rota tem ou não o /api baseado nas suas rotas de Admin
      .send({
        cpf: process.env.ADMIN_CPF, 
        senha: process.env.ADMIN_PASSWORD
      });

    adminToken = loginResponse.body.token;
  });

  afterAll(async () => {
    // Fecha a conexão limpa após todos os blocos 'it' passarem
    await sequelize.close();
  });

  // ... Seus blocos it() de CRUD continuam aqui embaixo
  // --- 1. TESTE DO CREATE ---
  it('POST /api/usuario - Deve criar um novo usuário com sucesso', async () => {
    const response = await request(app)
      .post('/api/usuario')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nome: 'João Silva',
        email: 'joao.silva@sistema.com',
        cpf: '12345678901',
        senha: 'senhaSegura123',
        cargo: 'usuario',
        secretariaId: null // Mantendo null se não tiver criado secretaria prévia no teste
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('usuario');
    expect(response.body).toHaveProperty('token');
    expect(response.body.usuario.nome).toBe('João Silva');
    expect(response.body.usuario).not.toHaveProperty('senha'); // Garantindo que não vazou a hash por segurança

    // Guarda o ID gerado para usar nos testes de READ, UPDATE e DELETE abaixo
    userIdCriado = response.body.usuario.id;
  });

  it('POST /api/usuario - Deve rejeitar conta já cadastrado', async () => {
    const response = await request(app)
      .post('/api/usuario')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nome: 'Outro Nome',
        email: 'joao.silva@sistema.com', // Mesmo email do teste anterior
        cpf: process.env.ADMIN_CPF, // Mesmo CPF do teste anterior
        senha: 'outraSenha123',
        cargo: 'gerente'
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Conta já cadastrado');
  });
  it('POST /api/usuario - Deve rejeitar cpf já cadastrado', async () => {
    const response = await request(app)
      .post('/api/usuario')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nome: 'Outro Nome',
        email: 'joao.silva@sistema.com', // Mesmo email do teste anterior
        cpf: '12345678901', // Mesmo CPF do teste anterior
        senha: 'outraSenha123',
        cargo: 'gerente'
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Conta já cadastrado');
  });

  // --- 2. TESTES DO READ ---
  it('GET /api/usuario - Deve listar todos os usuários cadastrados', async () => {
    const response = await request(app)
      .get('/api/usuario')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/usuario/:id - Deve buscar o usuário correto pelo ID', async () => {
    const response = await request(app)
      .get(`/api/usuario/${userIdCriado}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.id).toBe(userIdCriado);
    expect(response.body.email).toBe('joao.silva@sistema.com');
  });

  // --- 3. TESTE DO UPDATE ---
  it('PUT /api/usuario/:id - Deve atualizar os dados do usuário', async () => {
    const response = await request(app)
      .put(`/api/usuario/${userIdCriado}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nome: 'João Silva Atualizado',
        cargo: 'gerente'
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.nome).toBe('João Silva Atualizado');
    expect(response.body.cargo).toBe('gerente');
  });

  // --- 4. TESTE DO DELETE ---
  it('DELETE /api/usuario/:id - Deve remover o usuário com sucesso', async () => {
    const response = await request(app)
      .delete(`/api/usuario/${userIdCriado}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Usuário deletado com sucesso');

    // Validação extra: Tenta buscar o mesmo ID para garantir que ele sumiu do banco
    const getResponse = await request(app)
      .get(`/api/usuario/${userIdCriado}`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(getResponse.statusCode).toBe(404);
  });
});