const { Aprovado } = require("../models/Aprovado");

const criar = async ({ nomeEmpresa, dataContrato }, arquivo) => {
    if (!arquivo) {
        throw new Error("PDF não enviado");
    }

    return await Aprovado.create({
        nomeEmpresa,
        dataContrato,
        documentoPath: arquivo.path,
    });
};

const buscarDocumento = async (id) => {
    const aprovado = await Aprovado.findByPk(id);

    if (!aprovado) {
        throw new Error("Aprovado não encontrado");
    }

    return aprovado.documentoPath;
};

module.exports = {
    criar,
    buscarDocumento,
};