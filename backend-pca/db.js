const { Sequelize } = require("sequelize");
require("dotenv").config();
const bcrypt = require("bcrypt");


const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    logging: false,
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
async function createInitialAdmin() {
  const Admin = require("./src/models/Admin");
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminCPF = process.env.ADMIN_CPF;
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  const adminExists = await Admin.findOne({
    where: { email: "admin@sistema.com" },
  });

  if (!adminExists) {
    await Admin.create({
      nome: "Super Admin",
      email: "admin@sistema.com",
      cpf: adminCPF,
      senha: hashedPassword,
      cargo: "admin",
    });

    console.log("✅ Admin inicial criado");
  }
}
async function createInitialSecretarias() {
  const Secretaria = require("./src/models/Secretaria");

  const secretarias = [
    "Gabinete do Prefeito",
    "Secretaria de Administração",
    "Secretaria de Finanças",
    "Secretaria de Planejamento",
    "Secretaria de Educação",
    "Secretaria de Saúde",
    "Secretaria de Assistência Social",
    "Secretaria de Obras",
    "Secretaria de Infraestrutura",
    "Secretaria de Transportes",
    "Secretaria de Agricultura",
    "Secretaria de Meio Ambiente",
    "Secretaria de Cultura",
    "Secretaria de Esporte e Lazer",
    "Secretaria de Turismo",
    "Secretaria de Desenvolvimento Econômico",
    "Secretaria de Segurança Pública",
    "Secretaria de Habitação",
    "Secretaria de Comunicação",
    "Controladoria Geral",
    "Procuradoria Geral do Município",
  ];

  for (const nome of secretarias) {
    const existe = await Secretaria.findOne({
      where: { nome },
    });

    if (!existe) {
      await Secretaria.create({ nome });
      console.log(`✅ Secretaria "${nome}" criada.`);
    }
  }

  console.log("✅ Secretarias iniciais verificadas.");
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
  createInitialAdmin,
  createInitialSecretarias
};