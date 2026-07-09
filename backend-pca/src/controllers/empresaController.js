const { Empresa } = require("../models/associations");

const empresaController = {

    create: async (req, res) => {

        const { cnpj, nome, } = req.body;

        try {
            const existingEmpresa = await Empresa.findOne({ where: { cnpj } });
            if (existingEmpresa) {
                return res.status(400).json({ error: "CNPJ já cadastrado." });
            }
            const empresa = await Empresa.create({
                cnpj,
                nome

            });
            res.status(201).json(empresa);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }

    },
    getAll: async (req, res) => {
        try {
            const empresas = await Empresa.findAll();
            if (!empresas || empresas.length === 0) {
                return res.status(404).json({ error: "Nenhuma empresa encontrada" });
            }
            return res.status(200).json(empresas);
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                error: "Erro interno do servidor ao buscar empresas"
            });
        }
    },
    getById: async (req, res) => {
        const { id } = req.params;
        try {
            const empresa = await Empresa.findByPk(id);
            if (!empresa) {
                return res.status(404).json({ error: "Empresa não encontrada" });
            }
            return res.status(200).json(empresa);
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                error: "Erro interno do servidor ao buscar a empresa"
            });
        }
    }

}
module.exports = empresaController;