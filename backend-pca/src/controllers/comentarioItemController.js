const { ComentarioItem, Item, Contrato, Usuario, Admin, Notificacao } = require("../models/associations");

const comentarioItemController = {
  listar: async (req, res) => {
    try {
      const { itemId } = req.params;
      const comentarios = await ComentarioItem.findAll({
        where: { itemId },
        order: [["createdAt", "ASC"]],
      });
      res.json(comentarios);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao buscar comentários", error });
    }
  },

  criar: async (req, res) => {
    try {
      const { itemId } = req.params;
      const { texto } = req.body;
      const autorTipo = req.user.cargo;
      const autorId = req.user.id;

      if (!texto || !texto.trim()) {
        return res.status(400).json({ message: "Texto do comentário é obrigatório" });
      }

      const comentario = await ComentarioItem.create({
        texto: texto.trim(),
        itemId,
        autorTipo,
        autorId,
      });

      // Notificações em background — falha aqui não bloqueia o comentário
      Item.findByPk(itemId).then(async (item) => {
        if (!item) return;
        const contrato = await Contrato.findByPk(item.contratoId);
        if (!contrato) return;
        if (autorTipo === "admin") {
          const usuarios = await Usuario.findAll({ where: { secretariaId: contrato.secretariaId } });
          await Promise.all(usuarios.map((u) =>
            Notificacao.create({
              usuarioId: u.id,
              texto: `Admin comentou no item "${item.nome}"`,
              tipo: "comentario",
              referenciaId: item.contratoId,
              itemId: item.id,
              secretariaId: contrato.secretariaId,
            })
          ));
        } else {
          const admins = await Admin.findAll();
          await Promise.all(admins.map((a) =>
            Notificacao.create({
              adminId: a.id,
              texto: `Usuário comentou no item "${item.nome}" (${contrato.nome})`,
              tipo: "comentario_usuario",
              referenciaId: item.contratoId,
              itemId: item.id,
              secretariaId: contrato.secretariaId,
            })
          ));
        }
      }).catch((err) => console.error("❌ Erro ao criar notificação de comentário:", err.message));

      res.status(201).json(comentario);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao criar comentário", error });
    }
  },

  deletar: async (req, res) => {
    try {
      const { id } = req.params;
      const comentario = await ComentarioItem.findByPk(id);
      if (!comentario) return res.status(404).json({ message: "Comentário não encontrado" });

      const { cargo, id: userId } = req.user;
      const ehAutor = comentario.autorId === userId;
      const ehAdmin = cargo === "admin";

      if (!ehAutor && !ehAdmin) {
        return res.status(403).json({ message: "Sem permissão para deletar este comentário" });
      }

      await comentario.destroy();
      res.json({ message: "Comentário deletado com sucesso" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao deletar comentário", error });
    }
  },
};

module.exports = comentarioItemController;
