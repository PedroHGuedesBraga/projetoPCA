const { descontoEmpresa } = require("../models/associations");
const descontoEmpresaController = {
    create: async (req, res) => {
        const {
            contratoEmpresaId,
            motivoDesconto,
            valorDesconto,
            dataEnvio
        } = req.body;

        try {
            const novoDesconto = await descontoEmpresa.create({
                contratoEmpresaId,
                motivoDesconto,
                valorDesconto,
                dataEnvio
            });
            res.status(201).json(novoDesconto);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    getAll: async (req, res) => {
        const { contratoEmpresaId } = req.params;

        try {
            const descontos = await descontoEmpresa.findAll({
                where: { contratoEmpresaId },
                order: [["createdAt", "DESC"]],
            });

            const valorTotalDescontos = descontos.reduce((acc, d) => {
                return acc + parseFloat(d.valorDesconto);
            }, 0);

            const response = {
                contratoEmpresaId,
                totalDescontos: descontos.length,
                valorTotalDescontos,
                descontos: descontos.map(d => ({
                    id: d.id,
                    motivo: d.motivoDesconto,
                    valor: parseFloat(d.valorDesconto),
                    dataEnvio: d.dataEnvio,
                })),
            };

            res.status(200).json(response);

        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

};

module.exports = descontoEmpresaController;