const { Router } = require('express');
const { listConfiguracion, getConfiguracion, setConfiguracion } = require('../controllers/configuracion.controller');

const router = Router();
router.get('/', listConfiguracion);
router.get('/:clave', getConfiguracion);
router.put('/:clave', setConfiguracion);

module.exports = router;
