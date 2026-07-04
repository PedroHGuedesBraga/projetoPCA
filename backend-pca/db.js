const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  }
);

async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log("✅ Conectado ao banco com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao conectar ao banco:", error);
    throw error;
  }
}

async function syncDatabase() {
  try {
    await sequelize.sync({ alter: true });

    console.log("✅ Tabelas sincronizadas.");

    const queries = [
      `ALTER TABLE "Notificacaos" ALTER COLUMN "usuarioId" DROP NOT NULL`,
      `ALTER TABLE "Notificacaos" ALTER COLUMN "adminId" DROP NOT NULL`,
      `ALTER TABLE "Items" ALTER COLUMN "precoUnitario" DROP NOT NULL`,
      `ALTER TABLE "Items" ALTER COLUMN "descricao" DROP NOT NULL`,
    ];

    for (const sql of queries) {
      try {
        await sequelize.query(sql);
      } catch (err) {
        console.warn(`⚠️ ${err.message}`);
      }
    }
  } catch (err) {
    console.error("❌ Erro ao sincronizar banco:", err);
    throw err;
  }
}

module.exports = {
  sequelize,
  connectDB,
  syncDatabase,
};