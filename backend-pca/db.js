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
        rejectUnauthorized: false, // necessário para o Neon
      },
    },
  }
);

async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log("✅ Conectado ao banco PostgreSQL (Neon) com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao conectar ao banco:", error);
  }
}

module.exports = { sequelize, connectDB };
