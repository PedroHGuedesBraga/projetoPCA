const router = require('express').Router();
const contratoEmpresaController = require('../controllers/contratoEmpresaController');
//const authAdmin = require('../middleware/authAdmin');

router.post('/', contratoEmpresaController.create);  
router.get('/contratoUnico/:contratoId', contratoEmpresaController.getById);
router.get('/:empresaId', contratoEmpresaController.getAll);


module.exports = router;