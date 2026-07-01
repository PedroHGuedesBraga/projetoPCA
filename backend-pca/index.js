require("dotenv").config({ path: require("path").resolve(__dirname, ".env") });
const express = require("express");
const { connectDB, sequelize } = require("./db");
const Router = require("./src/routes/Router");
const setupSwagger = require("./swagger");
const cors = require('cors');
const app = express();

app.use(express.json());

/***const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://192.168.1.8",
  process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origem ${origin} não permitida`));
    }
  },
  credentials: true, // permite cookies/autenticação
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
};***/

app.use(cors({
    origin: true,
    credentials: true,
}));

// rotas centralizadas
app.use("/api", Router);
setupSwagger(app);

// conexão e sync
connectDB();
sequelize
  .sync({ alter: true })
  .then(async () => {
    console.log("✅ Tabelas sincronizadas com o banco.");
    // Garantir que usuarioId e adminId sejam nullable (necessário se tabela foi criada antes desse campo ser opcional)
    try {
      await sequelize.query(`ALTER TABLE "Notificacaos" ALTER COLUMN "usuarioId" DROP NOT NULL`);
    } catch (_) {}
    try {
      await sequelize.query(`ALTER TABLE "Notificacaos" ALTER COLUMN "adminId" DROP NOT NULL`);
    } catch (_) {}
    try {
      await sequelize.query(`ALTER TABLE "Items" ALTER COLUMN "precoUnitario" DROP NOT NULL`);
    } catch (_) {}
    try {
      await sequelize.query(`ALTER TABLE "Items" ALTER COLUMN "descricao" DROP NOT NULL`);
    } catch (_) {}
    await verificarVencimentos();
  })
  .catch((err) => console.error("❌ Erro ao sincronizar tabelas:", err));

// Job de vencimento — roda no startup e a cada 24h
async function verificarVencimentos() {
  try {
    const { Contrato, Admin, Notificacao } = require("./src/models/associations");
    const { Op } = require("sequelize");
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);

    const admins = await Admin.findAll();
    if (admins.length === 0) return;

    for (const dias of [10, 5]) {
      const alvo = new Date(hoje); alvo.setDate(alvo.getDate() + dias);
      const alvoStr = alvo.toISOString().split("T")[0];

      const contratos = await Contrato.findAll({
        where: { data: { [Op.between]: [`${alvoStr}T00:00:00`, `${alvoStr}T23:59:59`] }, aprovado: false },
      });

      for (const contrato of contratos) {
        // Evita duplicata: não cria se já existe notif do mesmo tipo hoje
        const jaExiste = await Notificacao.findOne({
          where: {
            referenciaId: contrato.id,
            tipo: `vencimento_${dias}`,
            createdAt: { [Op.gte]: hoje },
          },
        });
        if (jaExiste) continue;

        const texto = dias === 5
          ? `⚠️ URGENTE: Contrato "${contrato.nome}" vence em 5 dias`
          : `📅 Atenção: Contrato "${contrato.nome}" vence em 10 dias`;

        await Promise.all(admins.map((a) =>
          Notificacao.create({
            adminId: a.id,
            texto,
            tipo: `vencimento_${dias}`,
            referenciaId: contrato.id,
            secretariaId: contrato.secretariaId,
          })
        ));
      }
    }
    console.log("✅ Verificação de vencimentos concluída.");
  } catch (err) {
    console.error("❌ Erro no job de vencimentos:", err.message);
  }
}

setInterval(verificarVencimentos, 24 * 60 * 60 * 1000);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando`));
