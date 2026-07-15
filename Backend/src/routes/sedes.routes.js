const { Router } = require('express');
const { listSedes } = require('../controllers/sedes.controller');

const router = Router();

router.get('/', listSedes);

module.exports = router;
