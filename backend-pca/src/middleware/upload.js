const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Cria a pasta na raiz do projeto para ficar mais organizado
const pastaUploads = path.resolve(__dirname, "../../uploads/pdfs");

if (!fs.existsSync(pastaUploads)) {
    fs.mkdirSync(pastaUploads, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, pastaUploads);
    },
    filename: (req, file, cb) => {
        // Ex: 171829381239-documento.pdf
        const sufixoUnico = Date.now() + "-" + Math.round(Math.random() * 1E9);
        cb(null, sufixoUnico + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
        // Retorna um erro que o express vai capturar
        return cb(new Error("Formato inválido. Apenas PDFs são permitidos."), false);
    }
    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 100 * 1024 * 1024 } // Limite opcional: 100mb
});

module.exports = upload;