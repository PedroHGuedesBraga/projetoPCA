const { Secretaria,Contrato  } = require("../models/associations");

const secretariaController = {
    // CREATE - criar secretaria
    create: async (req, res) => {
        try {
            const { nome } = req.body;
            const secretaria = await Secretaria.create({ nome });
            res.status(201).json(secretaria);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Erro ao criar secretaria", error });
        }
    },

    // READ - listar todas as secretarias
    getAll: async (req, res) => {
        try {
            const secretarias = await Secretaria.findAll();
            res.json(secretarias);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Erro ao buscar secretarias", error });
        }
    },

    // READ - buscar por id
    getById: async (req, res) => {
        try {
            const { id } = req.params;
            const secretaria = await Secretaria.findByPk(id);
            if (!secretaria) return res.status(404).json({ message: "Secretaria não encontrada" });
            res.json(secretaria);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Erro ao buscar secretaria", error });
        }
    },

    // UPDATE - atualizar secretaria
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { nome } = req.body;
            const secretaria = await Secretaria.findByPk(id);
            if (!secretaria) return res.status(404).json({ message: "Secretaria não encontrada" });
            secretaria.nome = nome;
            await secretaria.save();
            res.json(secretaria);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Erro ao atualizar secretaria", error });
        }
    },

    // DELETE - remover secretaria
    delete: async (req, res) => {
        try {
            const { id } = req.params;
            const secretaria = await Secretaria.findByPk(id);
            if (!secretaria) return res.status(404).json({ message: "Secretaria não encontrada" });
            await secretaria.destroy();
            res.json({ message: "Secretaria deletada com sucesso" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Erro ao deletar secretaria", error });
        }
    },
getContratosOrganizados: async (req, res) => {
  try {
    const { id } = req.params;

    const secretaria = await Secretaria.findOne({
      where: { id },
      include: [{ model: Contrato, as: "contratos" }], // pegar contratos
    });

    if (!secretaria) return res.status(404).json({ message: "Secretaria não encontrada" });

    const grouped = {};

    // Agrupar por ano e mês
    (secretaria.contratos || []).forEach(c => {
      const date = new Date(c.data); // garantir objeto Date
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");

      if (!grouped[year]) grouped[year] = {};
      if (!grouped[year][month]) grouped[year][month] = [];

      grouped[year][month].push(c);
    });

    res.json(grouped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar contratos organizados", error: error.message });
  }
}





}
module.exports = secretariaController