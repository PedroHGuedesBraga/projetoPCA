const router = require('express').Router();
const descontoEmpresaController = require('../controllers/descontoEmpresaController');

router.post('/', descontoEmpresaController.create);  
router.get('/:contratoEmpresaId', descontoEmpresaController.getAll);

module.exports = router;