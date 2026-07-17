const { Router } = require('express');
const { getKpis } = require('../controllers/dashboard.controller');

const router = Router();
router.get('/kpis', getKpis);

module.exports = router;
