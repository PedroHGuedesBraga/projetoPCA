const {contratoEmpresa} = require("../models/associations");
const { sequelize } = require("../../db");

const contratoEmpresaController = {

    create:async (req, res) =>{ 
        const { empresaId, nomeContrato, valorContrato, dataInicioContrato, dataTerminoContrato } = req.body;

        try {
            const contrato = await contratoEmpresa.create({
                empresaId,
                nomeContrato,
                valorContrato,
                dataInicioContrato,
                dataTerminoContrato
            });
            res.status(201).json(contrato);
        }
        catch(error){
            res.status(400).json({ error: error.message });
        }
    },

    getAll: async (req, res) =>{
        const { empresaId } = req.params;
        try{
            const contratos = await contratoEmpresa.findAll({ 
            where: { empresaId },
            attributes: ["id", "nomeContrato"]  });
            res.status(200).json(contratos);
        }catch(error){
            res.status(500).json({error: error.message});
        }

    },

    getById: async(req,res)=>{
        const {contratoId} = req.params;
        try{
            const contrato = await contratoEmpresa.findOne({
                where: { id: contratoId },
               });
            res.status(200).json(contrato);
        }
        catch(error){
            res.status(500).json({error: error.message});
        }
    }


}
module.exports = contratoEmpresaController;