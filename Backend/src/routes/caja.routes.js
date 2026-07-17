const { Router } = require('express');
const { getResumenCaja, crearCierreCaja } = require('../controllers/caja.controller');

const router = Router();
router.get('/resumen', getResumenCaja);
router.post('/cierres', crearCierreCaja);

module.exports = router;
