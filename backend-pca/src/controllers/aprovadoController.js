const aprovadoService = require("../services/aprovadoService");
const { Aprovado } = require("../models/Aprovado");

const create = async (req, res) => {
    try {
        const { nomeEmpresa, dataContrato } = req.body;

        // req.file foi injetado pelo middleware do multer
        const aprovado = await aprovadoService.criar(
            { nomeEmpresa, dataContrato },
            req.file
        );

        return res.status(201).json(aprovado);
    } catch (err) {
        if (err.message === "PDF não enviado" || err.message.includes("permitidos")) {
            return res.status(400).json({ error: err.message });
        }
        console.error(err);
        return res.status(500).json({ error: "Erro interno ao salvar os dados." });
    }
};

const baixarDocumento = async (req, res) => {
    try {
        const { id } = req.params;
        const documentoPath = await aprovadoService.buscarDocumento(id);

        // O Express faz o download do arquivo do caminho absoluto automaticamente aqui
        return res.download(documentoPath);
    } catch (err) {
        if (err.message === "Aprovado não encontrado") {
            return res.status(404).json({ error: err.message });
        }
        console.error(err);
        return res.status(500).json({ error: "Erro ao baixar o documento." });
    }
};

// Funções extras que estavam declaradas nas suas rotas para não quebrar o código
const getAll = async (req, res) => {
    const dados = await Aprovado.findAll();
    return res.json(dados);
};

const getById = async (req, res) => {
    const dado = await Aprovado.findByPk(req.params.id);
    if (!dado) return res.status(404).json({ error: "Não encontrado" });
    return res.json(dado);
};

module.exports = {
    create,
    baixarDocumento,
    getAll,
    getById
};