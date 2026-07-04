const { contratoEmpresa } = require("../models/associations");

const contratoEmpresaController = {
  // CREATE
  create: async (req, res) => {
    const {
      empresaId,
      nomeContrato,
      valorContrato,
      dataInicioContrato,
      dataTerminoContrato,
    } = req.body;

    try {
      if (
        !empresaId ||
        !nomeContrato ||
        valorContrato == null ||
        !dataInicioContrato ||
        !dataTerminoContrato
      ) {
        return res.status(400).json({
          error: "Campos obrigatórios não informados.",
        });
      }

      const contrato = await contratoEmpresa.create({
        empresaId,
        nomeContrato,
        valorContrato,
        dataInicioContrato,
        dataTerminoContrato,
      });

      return res.status(201).json(contrato);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  // GET ALL BY EMPRESA
  getAll: async (req, res) => {
    const { empresaId } = req.params;

    try {
      if (!empresaId) {
        return res.status(400).json({
          error: "empresaId é obrigatório.",
        });
      }

      const contratos = await contratoEmpresa.findAll({
        where: { empresaId },
        attributes: ["id", "nomeContrato", "valorContrato"],
      });

      return res.status(200).json(contratos);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  // GET BY ID
  getById: async (req, res) => {
    const { contratoId } = req.params;

    try {
      if (!contratoId) {
        return res.status(400).json({
          error: "contratoId é obrigatório.",
        });
      }

      const contrato = await contratoEmpresa.findOne({
        where: { id: contratoId },
      });

      if (!contrato) {
        return res.status(404).json({
          error: "Contrato não encontrado.",
        });
      }

      return res.status(200).json(contrato);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
};

module.exports = contratoEmpresaController;