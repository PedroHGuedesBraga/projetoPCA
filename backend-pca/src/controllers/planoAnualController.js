const { Secretaria, Contrato, Item } = require("../models/associations");
const { Op } = require("sequelize");

const planoAnualController = {
  getByAno: async (req, res) => {
    try {
      const { ano } = req.params;

      const secretarias = await Secretaria.findAll({
        include: [{
          model: Contrato,
          as: "contratos",
          where: { data: { [Op.between]: [`${ano}-01-01`, `${ano}-12-31`] } },
          required: false,
          include: [{ model: Item }],
        }],
        order: [
          ["nome", "ASC"],
          [{ model: Contrato, as: "contratos" }, "data", "ASC"],
        ],
      });

      const resultado = secretarias
        .map(s => s.toJSON())
        .filter(s => s.contratos && s.contratos.length > 0);

      res.json(resultado);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao buscar plano anual", error });
    }
  },
};

module.exports = planoAnualController;
