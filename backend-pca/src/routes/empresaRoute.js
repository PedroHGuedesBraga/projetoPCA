const router = require('express').Router();
const empresaController = require('../controllers/empresaController');
//const authAdmin = require('../middleware/authAdmin');

router.post('/', empresaController.create);
router.get('/', empresaController.getAll);
router.get('/:id', empresaController.getById);

module.exports = router;