const { Contrato, Item, Secretaria } = require("../models/associations");
const { Op } = require("sequelize");

const contratoController = {
  // CREATE - criar contrato
  create: async (req, res) => {
    try {
      const { nome, data, status, aprovado, itensQuantidade, secretariaId } = req.body;

      // ⚠️ Verifica se a secretariaId foi enviada
      if (!secretariaId) {
        return res.status(400).json({ message: "secretariaId é obrigatório" });
      }

      const ano = new Date().getFullYear();
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const prefixo = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      const total = await Contrato.count({
        where: { codigoRastreio: { [Op.like]: `%-${ano}-%` } }
      });
      const codigoRastreio = `${prefixo}-${ano}-${String(total + 1).padStart(4, '0')}`;

      const contrato = await Contrato.create({
        nome,
        data,
        status,
        aprovado,
        itensQuantidade,
        secretariaId,
        codigoRastreio,
      });

      res.status(201).json(contrato);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao criar contrato", error });
    }
  },

  // READ - listar todos os contratos
  getAll: async (req, res) => {
    try {
      const contratos = await Contrato.findAll({
        include: [{ model: Secretaria, as: "secretaria", attributes: ["id", "nome"] }],
        order: [["createdAt", "DESC"]],
      });
      res.json(contratos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao buscar contratos", error });
    }
  },

  // READ - buscar contrato por ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const contrato = await Contrato.findByPk(id);
      if (!contrato) return res.status(404).json({ message: "Contrato não encontrado" });
      res.json(contrato);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao buscar contrato", error });
    }
  },

  // UPDATE - atualizar contrato
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { nome, data, status, aprovado, itensQuantidade } = req.body;

      const contrato = await Contrato.findByPk(id);
      if (!contrato) return res.status(404).json({ message: "Contrato não encontrado" });

      contrato.nome = nome !== undefined ? nome : contrato.nome;
      contrato.data = data !== undefined ? data : contrato.data;
      contrato.status = status !== undefined ? status : contrato.status;
      contrato.aprovado = aprovado !== undefined ? aprovado : contrato.aprovado;
      contrato.itensQuantidade = itensQuantidade !== undefined ? itensQuantidade : contrato.itensQuantidade;

      await contrato.save();
      res.json(contrato);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao atualizar contrato", error });
    }
  },

  // DELETE - remover contrato
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const contrato = await Contrato.findByPk(id);
      if (!contrato) return res.status(404).json({ message: "Contrato não encontrado" });
      await contrato.destroy();
      res.json({ message: "Contrato deletado com sucesso" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao deletar contrato", error });
    }
  },
  // MUDAR DE MÊS — exige justificativa
  mudarMes: async (req, res) => {
    try {
      const { id } = req.params;
      const { data, justificativa } = req.body;

      if (!data) return res.status(400).json({ message: "Nova data é obrigatória" });
      if (!justificativa || !justificativa.trim()) {
        return res.status(400).json({ message: "Justificativa é obrigatória para mudar o mês do contrato" });
      }

      const contrato = await Contrato.findByPk(id);
      if (!contrato) return res.status(404).json({ message: "Contrato não encontrado" });

      contrato.data = data;
      contrato.justificativa = justificativa.trim();
      await contrato.save();

      res.json(contrato);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao mudar mês do contrato", error });
    }
  },

  // CLONAR TODOS OS CONTRATOS DE UM ANO PARA O SEGUINTE
  clonarAno: async (req, res) => {
    try {
      const { secretariaId, anoOrigem } = req.body;
      if (!secretariaId || !anoOrigem) {
        return res.status(400).json({ message: "secretariaId e anoOrigem são obrigatórios" });
      }

      const anoDestino = parseInt(anoOrigem) + 1;
      const contratos = await Contrato.findAll({
        where: {
          secretariaId,
          data: { [Op.between]: [`${anoOrigem}-01-01`, `${anoOrigem}-12-31`] },
        },
        include: [{ model: Item }],
      });

      if (contratos.length === 0) {
        return res.status(404).json({ message: `Nenhum contrato encontrado em ${anoOrigem}` });
      }

      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let clonados = 0;

      for (const contrato of contratos) {
        const dataOriginal = new Date(contrato.data);
        dataOriginal.setFullYear(anoDestino);
        const novaDataStr = dataOriginal.toISOString().split('T')[0];

        const prefixo = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        const total = await Contrato.count({ where: { codigoRastreio: { [Op.like]: `%-${anoDestino}-%` } } });
        const codigoRastreio = `${prefixo}-${anoDestino}-${String(total + 1).padStart(4, '0')}`;

        const novoContrato = await Contrato.create({
          nome: contrato.nome,
          data: novaDataStr,
          status: 'rascunho',
          aprovado: false,
          secretariaId,
          itensQuantidade: contrato.Items?.length || 0,
          codigoRastreio,
        });

        if (contrato.Items && contrato.Items.length > 0) {
          await Promise.all(contrato.Items.map(item =>
            Item.create({
              nome: item.nome,
              descricao: item.descricao,
              quantidadeItem: item.quantidadeItem,
              unidadeDeMedida: item.unidadeDeMedida,
              data: novaDataStr,
              aprovado: false,
              contratoId: novoContrato.id,
            })
          ));
        }

        clonados++;
      }

      res.json({ clonados, anoDestino });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao clonar contratos", error });
    }
  },

  // BUSCAR ITENS DE UM CONTRATO (Mesmo que vazio)
 

getItensByContrato: async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Busca os dados básicos do contrato
    const contrato = await Contrato.findByPk(id);

    if (!contrato) {
      return res.status(404).json({ message: "Contrato não encontrado no banco" });
    }

    // 2. Busca todos os itens que apontam para este contrato
    const itens = await Item.findAll({
      where: { contratoId: id }
    });

    // 3. Retorna um objeto combinado para o frontend
    // Isso evita o erro de "itens undefined" no seu map do React
    res.json({
      ...contrato.toJSON(),
      itens: itens || [] 
    });

  } catch (error) {
    console.error("Erro ao buscar itens do contrato:", error);
    res.status(500).json({ message: "Erro interno no servidor", error: error.message });
  }
},


};

module.exports = contratoController;
