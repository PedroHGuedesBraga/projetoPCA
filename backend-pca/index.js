require("dotenv").config({
  path: require("path").resolve(__dirname, ".env"),
});

const express = require("express");
const cors = require("cors");

const { connectDB, syncDatabase, createInitialAdmin,  createInitialSecretarias } = require("./db");

const Router = require("./src/routes/Router");
const setupSwagger = require("./swagger");

const verificarVencimentos = require("./src/jobs/verificarVencimentos");

const app = express();

app.use(express.json());
app.set('trust proxy', 1);

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use("/api", Router);

setupSwagger(app);

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

async function startServer() {
  try {
    await connectDB();

    await syncDatabase();
    
    await createInitialAdmin();
    
    createInitialSecretarias();


    await verificarVencimentos();

    
    setInterval(
      verificarVencimentos,
      24 * 60 * 60 * 1000
    );

    const PORT = process.env.PORT;

    app.listen(PORT, () => {
      console.log(`Servidor rodando `);
    });
  } catch (err) {
    console.error("❌ Falha ao iniciar aplicação:", err);
    process.exit(1);
  }
}

module.exports = app;