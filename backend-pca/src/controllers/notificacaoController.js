const { Notificacao } = require("../models/associations");


const notificacaoController = {
  listar: async (req, res) => {
    try {
      const notificacoes = await Notificacao.findAll({
        where: { usuarioId: req.usuarioId },
        order: [["createdAt", "DESC"]],
        limit: 50,
      });
      res.json(notificacoes);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao buscar notificações", error });
    }
  },

  marcarLida: async (req, res) => {
    try {
      const { id } = req.params;
      const notif = await Notificacao.findOne({ where: { id, usuarioId: req.usuarioId } });
      if (!notif) return res.status(404).json({ message: "Notificação não encontrada" });
      notif.lida = true;
      await notif.save();
      res.json(notif);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao marcar notificação", error });
    }
  },

  marcarTodasLidas: async (req, res) => {
    try {
      await Notificacao.update(
        { lida: true },
        { where: { usuarioId: req.usuarioId, lida: false } }
      );
      res.json({ message: "Todas as notificações marcadas como lidas" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao marcar notificações", error });
    }
  },
  // ── Admin ──────────────────────────────────────────────────────
  listarAdmin: async (req, res) => {
    try {
      const notificacoes = await Notificacao.findAll({
        where: { adminId: req.adminId },
        order: [["createdAt", "DESC"]],
        limit: 50,
      });
      res.json(notificacoes);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar notificações", error });
    }
  },

  marcarLidaAdmin: async (req, res) => {
    try {
      const { id } = req.params;
      const notif = await Notificacao.findOne({ where: { id, adminId: req.adminId } });
      if (!notif) return res.status(404).json({ message: "Notificação não encontrada" });
      notif.lida = true;
      await notif.save();
      res.json(notif);
    } catch (error) {
      res.status(500).json({ message: "Erro ao marcar notificação", error });
    }
  },

  marcarTodasLidasAdmin: async (req, res) => {
    try {
      await Notificacao.update(
        { lida: true },
        { where: { adminId: req.adminId, lida: false } }
      );
      res.json({ message: "Todas as notificações marcadas como lidas" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao marcar notificações", error });
    }
  },
};

module.exports = notificacaoController;
