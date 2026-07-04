const { Empresa} = require("../models/associations");
const { sequelize } = require("../../db");

const empresaController = {

    create:async (req, res) =>{

        const { cnpj, nome, valorContrato, dataInicioContrato, dataTerminoContrato } = req.body;

        try {
            const empresa = await Empresa.create({
                cnpj,
                nome,
                valorContrato,
                dataInicioContrato,
                dataTerminoContrato
            });
            res.status(201).json(empresa);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }

    },
    getAll: async (req, res) =>{
        try{
            const empresas = await Empresa.findAll();
            res.status(200).json(empresas);
        }catch(error){
            res.status(500).json({error: error.message});
        }
    },
    getById: async(req,res)=>{
        const {id} = req.params;
        try{
            const empresa = await Empresa.findByPk(id);
            res.status(200).json(empresa);
        }
        catch(error){
            res.status(500).json({error: error.message});
        }   
    }

}
module.exports = empresaController;