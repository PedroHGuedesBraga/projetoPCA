const { Admin } = require("../models/associations");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const adminController = {
  // CREATE - criar admin
  create: async (req, res) => {
    try {
      const { nome, email, cpf, senha } = req.body;

      const existingAdmin = await Admin.findOne({ where: { email } });
      if (existingAdmin)
        return res.status(400).json({ message: "Email já cadastrado" });

      const hashedPassword = await bcrypt.hash(senha, 10);

      const admin = await Admin.create({
        nome,
        email,
        cpf,
        senha: hashedPassword,
        cargo: "admin", // sempre admin
      });

      const token = jwt.sign(
        { id: admin.id, email: admin.email, cargo: admin.cargo },
        process.env.JWT_ADMIN_SECRET,
        { expiresIn: "1d" }
      );

      res.status(201).json({ admin, token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao criar admin", error });
    }
  },

  // READ - listar todos os admins
  getAll: async (req, res) => {
    try {
      const admins = await Admin.findAll();
      res.json(admins);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao buscar admins", error });
    }
  },

  // READ - buscar por ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const admin = await Admin.findByPk(id);
      if (!admin) return res.status(404).json({ message: "Admin não encontrado" });
      res.json(admin);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao buscar admin", error });
    }
  },

  // UPDATE - atualizar admin
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { nome, email, cpf, senha } = req.body;
      const admin = await Admin.findByPk(id);
      if (!admin) return res.status(404).json({ message: "Admin não encontrado" });

      admin.nome = nome || admin.nome;
      admin.email = email || admin.email;
      admin.cpf = cpf || admin.cpf;

      if (senha) {
        admin.senha = await bcrypt.hash(senha, 10);
      }

      await admin.save();
      res.json(admin);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao atualizar admin", error });
    }
  },

  // DELETE - remover admin
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const admin = await Admin.findByPk(id);
      if (!admin) return res.status(404).json({ message: "Admin não encontrado" });
      await admin.destroy();
      res.json({ message: "Admin deletado com sucesso" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao deletar admin", error });
    }
  },

  // LOGIN - autenticação
  login: async (req, res) => {
  try {
    const { cpf, senha } = req.body;
    const cpfLimpo = cpf.replace(/\D/g, '');
    const cpfFormatado = cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    let admin = await Admin.findOne({ where: { cpf: cpfLimpo } });
    if (!admin) admin = await Admin.findOne({ where: { cpf: cpfFormatado } });
    if (!admin) return res.status(404).json({ message: "Admin não encontrado" });

    const isMatch = await bcrypt.compare(senha, admin.senha);
    if (!isMatch) return res.status(401).json({ message: "Senha inválida" });

    const token = jwt.sign(
      { id: admin.id, email: admin.email, cargo: admin.cargo },
      process.env.JWT_ADMIN_SECRET,
      { expiresIn: "1d" }
    );

    // Extrair apenas os campos seguros
    const { id, nome, email: adminEmail, cargo } = admin;
    res.json({ admin: { id, nome, email: adminEmail, cargo }, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao fazer login", error });
  }
},

};

module.exports = adminController;
