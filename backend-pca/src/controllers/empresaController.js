const { Empresa} = require("../models/associations");
const { sequelize } = require("../../db");

const empresaController = {

    create:async (req, res) =>{

        const {cnpj, nome,} = req.body;

        try {
            const existingEmpresa = await Empresa.findOne({ where: { cnpj } });
            if (existingEmpresa) {
                return res.status(400).json({ error: "CNPJ já cadastrado." });
            }
            const empresa = await Empresa.create({
                cnpj,
                nome
    
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
            if (!empresa) return res.status(404).json({ error: "Empresa não encontrada" });
        }
    },
    getById: async(req,res)=>{
        const {id} = req.params;
        try{
            const empresa = await Empresa.findByPk(id);
            res.status(200).json(empresa);
        }
        catch(error){
            if (!empresa) return res.status(404).json({ error: "Empresa não encontrada" });
        }   
    }

}
module.exports = empresaController;