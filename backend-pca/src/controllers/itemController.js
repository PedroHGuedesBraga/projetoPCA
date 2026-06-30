const { Item, Contrato, Usuario, Notificacao } = require("../models/associations");

const itemController = {
  // CREATE - criar item
  create: async (req, res) => {
    try {
      const { nome, descricao, quantidadeItem, precoUnitario, data, unidadeDeMedida, aprovado, contratoId } = req.body;

      if (!contratoId) {
        return res.status(400).json({ message: "contratoId é obrigatório" });
      }

      const item = await Item.create({
        nome,
        descricao,
        quantidadeItem,
        precoUnitario,
        data,
        unidadeDeMedida,
        aprovado,
        contratoId,
      });

      res.status(201).json(item);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao criar item", error });
    }
  },

  // READ - listar todos os itens
  getAll: async (req, res) => {
    try {
      const items = await Item.findAll();
      res.json(items);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao buscar itens", error });
    }
  },

  // READ - buscar item por ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const item = await Item.findByPk(id);
      if (!item) return res.status(404).json({ message: "Item não encontrado" });
      res.json(item);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao buscar item", error });
    }
  },

  // UPDATE - atualizar item
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { nome, descricao, quantidadeItem, precoUnitario, data, unidadeDeMedida, aprovado } = req.body;

      const item = await Item.findByPk(id);
      if (!item) return res.status(404).json({ message: "Item não encontrado" });

      item.nome = nome !== undefined ? nome : item.nome;
      item.descricao = descricao !== undefined ? descricao : item.descricao;
      item.quantidadeItem = quantidadeItem !== undefined ? quantidadeItem : item.quantidadeItem;
      item.precoUnitario = precoUnitario !== undefined ? precoUnitario : item.precoUnitario;
      item.data = data !== undefined ? data : item.data;
      item.unidadeDeMedida = unidadeDeMedida !== undefined ? unidadeDeMedida : item.unidadeDeMedida;
      item.aprovado = aprovado !== undefined ? aprovado : item.aprovado;

      await item.save();
      res.json(item);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao atualizar item", error });
    }
  },

  // PATCH - toggle aprovado (admin only)
  toggleAprovado: async (req, res) => {
    try {
      const { id } = req.params;
      const { aprovado } = req.body;

      const item = await Item.findByPk(id);
      if (!item) return res.status(404).json({ message: "Item não encontrado" });

      item.aprovado = aprovado !== undefined ? aprovado : !item.aprovado;
      await item.save();

      const contrato = await Contrato.findByPk(item.contratoId);
      if (contrato) {
        // Notifica usuários quando item é aprovado
        if (item.aprovado) {
          const usuarios = await Usuario.findAll({ where: { secretariaId: contrato.secretariaId } });
          await Promise.all(
            usuarios.map((u) =>
              Notificacao.create({
                usuarioId: u.id,
                texto: `Item "${item.nome}" foi aprovado`,
                tipo: "item_aprovado",
                referenciaId: item.contratoId,
                itemId: item.id,
                secretariaId: contrato.secretariaId,
              })
            )
          );
        }

        // Auto-aprovação do contrato quando todos os itens estão aprovados
        const todosItens = await Item.findAll({ where: { contratoId: item.contratoId } });
        const todosAprovados = todosItens.length > 0 && todosItens.every((i) => i.aprovado);
        if (contrato.aprovado !== todosAprovados) {
          contrato.aprovado = todosAprovados;
          await contrato.save();
        }
      }

      res.json(item);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao atualizar aprovação", error });
    }
  },

  // PATCH - aprovar todos os itens do contrato (admin only)
  aprovarTodos: async (req, res) => {
    try {
      const { contratoId } = req.params;
      const contrato = await Contrato.findByPk(contratoId);
      if (!contrato) return res.status(404).json({ message: "Contrato não encontrado" });

      const itens = await Item.findAll({ where: { contratoId } });
      if (itens.length === 0) return res.status(400).json({ message: "Contrato sem itens" });

      await Promise.all(itens.map((i) => { i.aprovado = true; return i.save(); }));

      contrato.aprovado = true;
      await contrato.save();

      // Notifica usuários
      const usuarios = await Usuario.findAll({ where: { secretariaId: contrato.secretariaId } });
      await Promise.all(
        itens.flatMap((item) =>
          usuarios.map((u) =>
            Notificacao.create({
              usuarioId: u.id,
              texto: `Item "${item.nome}" foi aprovado`,
              tipo: "item_aprovado",
              referenciaId: contratoId,
              itemId: item.id,
              secretariaId: contrato.secretariaId,
            })
          )
        )
      );

      res.json({ message: "Todos os itens aprovados", total: itens.length });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao aprovar todos os itens", error });
    }
  },

  // DELETE - remover item
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const item = await Item.findByPk(id);
      if (!item) return res.status(404).json({ message: "Item não encontrado" });
      await item.destroy();
      res.json({ message: "Item deletado com sucesso" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao deletar item", error });
    }
  },
};

module.exports = itemController;
