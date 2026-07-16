const { Router } = require('express');
const { listEps } = require('../controllers/eps.controller');

const router = Router();

router.get('/', listEps);

module.exports = router;
