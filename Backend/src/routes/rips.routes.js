const { Router } = require('express');
const { listRips, getRips, generarRips } = require('../controllers/rips.controller');

const router = Router();
router.get('/', listRips);
router.get('/:id', getRips);
router.post('/generar', generarRips);

module.exports = router;
