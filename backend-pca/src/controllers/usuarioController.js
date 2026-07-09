const { Usuario, Secretaria, Admin } = require("../models/associations");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


const usuarioController = {
    // CREATE - criar usuário
    create: async (req, res) => {
        try {
            const { nome, email, cpf, senha, cargo, secretariaId } = req.body;
            const existingAdmin = await Admin.findOne({ where: { cpf } });
            if(existingAdmin){
                return res.status(400).json({ message: "Conta já cadastrado" });
            }
            // checar se já existe usuário com o mesmo email
            const existingUser = await Usuario.findOne({ where: { cpf } });
            if (existingUser){
                return res.status(400).json({ message: "Conta já cadastrado" });
            }
                

            const hashedPassword = await bcrypt.hash(senha, 10);

            // ... código anterior do create
            const usuario = await Usuario.create({
                nome,
                email,
                cpf,
                senha: hashedPassword,
                cargo,
                secretariaId,
            });

            // Criar token JWT
            const token = jwt.sign(
                { id: usuario.id, email: usuario.email, cargo: usuario.cargo },
                process.env.JWT_USER_SECRET,
                { expiresIn: "1d" }
            );

            // ✨ CORREÇÃO: Converte para objeto plano e remove a senha antes de enviar
            const usuarioResponse = usuario.toJSON();
            delete usuarioResponse.senha;

            res.status(201).json({ usuario: usuarioResponse, token });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Erro ao criar usuário", error });
        }
    },

    // READ - listar todos os usuários
    getAll: async (req, res) => {
        try {
            const usuarios = await Usuario.findAll({ include: [{ model: Secretaria }] });
            res.json(usuarios);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Erro ao buscar usuários", error });
        }
    },

    // READ - buscar por ID
    getById: async (req, res) => {
        try {
            const { id } = req.params;
            const usuario = await Usuario.findByPk(id, { include: [{ model: Secretaria }] });
            if (!usuario) return res.status(404).json({ message: "Usuário não encontrado" });
            res.json(usuario);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Erro ao buscar usuário", error });
        }
    },

    // UPDATE - atualizar usuário
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { nome, email, cpf, senha, cargo, secretariaId } = req.body;
            const usuario = await Usuario.findByPk(id);
            if (!usuario) return res.status(404).json({ message: "Usuário não encontrado" });

            usuario.nome = nome || usuario.nome;
            usuario.email = email || usuario.email;
            usuario.cpf = cpf || usuario.cpf;
            usuario.cargo = cargo || usuario.cargo;
            usuario.secretariaId = secretariaId || usuario.secretariaId;

            if (senha) {
                usuario.senha = await bcrypt.hash(senha, 10);
            }

            await usuario.save();
            res.json(usuario);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Erro ao atualizar usuário", error });
        }
    },

    // DELETE - remover usuário
    delete: async (req, res) => {
        try {
            const { id } = req.params;
            const usuario = await Usuario.findByPk(id);
            if (!usuario) return res.status(404).json({ message: "Usuário não encontrado" });
            await usuario.destroy();
            res.json({ message: "Usuário deletado com sucesso" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Erro ao deletar usuário", error });
        }
    },

    // LOGIN - autenticação
    login: async (req, res) => {
        try {
            const { cpf, senha } = req.body;
            const cpfLimpo = cpf.replace(/\D/g, '');
            const cpfFormatado = cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
            let usuario = await Usuario.findOne({ where: { cpf: cpfLimpo } });
            if (!usuario) usuario = await Usuario.findOne({ where: { cpf: cpfFormatado } });
            if (!usuario) return res.status(404).json({ message: "Usuário não encontrado" });

            const isMatch = await bcrypt.compare(senha, usuario.senha);
            if (!isMatch) return res.status(401).json({ message: "Senha inválida" });

            const token = jwt.sign(
                { id: usuario.id, cpf: usuario.cpf, cargo: usuario.cargo },
                process.env.JWT_USER_SECRET,
                { expiresIn: "30m" }
            );
            const usuarioResponse = usuario.toJSON();
            delete usuarioResponse.senha;
            // Extrair apenas os campos seguros
            res.json({ usuario: usuarioResponse, token });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Erro ao fazer login", error });
        }
    },
};

module.exports = usuarioController;
