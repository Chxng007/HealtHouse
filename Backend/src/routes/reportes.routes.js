const { Router } = require('express');
const { getIndicadores, exportarExcel } = require('../controllers/reportes.controller');

const router = Router();
router.get('/indicadores', getIndicadores);
router.get('/exportar.xlsx', exportarExcel);

module.exports = router;
