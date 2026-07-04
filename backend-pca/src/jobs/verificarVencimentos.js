const { Contrato, Admin, Notificacao } = require("../models/associations");
const { Op } = require("sequelize");

async function verificarVencimentos() {
  try {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const admins = await Admin.findAll();

    if (!admins.length) return;

    for (const dias of [10, 5]) {
      const alvo = new Date(hoje);
      alvo.setDate(alvo.getDate() + dias);

      const alvoStr = alvo.toISOString().split("T")[0];

      const contratos = await Contrato.findAll({
        where: {
          data: {
            [Op.between]: [
              `${alvoStr}T00:00:00`,
              `${alvoStr}T23:59:59`,
            ],
          },
          aprovado: false,
        },
      });

      for (const contrato of contratos) {
        const existe = await Notificacao.findOne({
          where: {
            referenciaId: contrato.id,
            tipo: `vencimento_${dias}`,
            createdAt: {
              [Op.gte]: hoje,
            },
          },
        });

        if (existe) continue;

        const texto =
          dias === 5
            ? `⚠️ URGENTE: Contrato "${contrato.nome}" vence em 5 dias`
            : `📅 Atenção: Contrato "${contrato.nome}" vence em 10 dias`;

        await Promise.all(
          admins.map((admin) =>
            Notificacao.create({
              adminId: admin.id,
              texto,
              tipo: `vencimento_${dias}`,
              referenciaId: contrato.id,
              secretariaId: contrato.secretariaId,
            })
          )
        );
      }
    }

    console.log("✅ Job de vencimentos executado.");
  } catch (err) {
    console.error("❌ Erro no job:", err.message);
  }
}

module.exports = verificarVencimentos;