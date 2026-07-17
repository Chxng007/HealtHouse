const { Router } = require('express');
const { searchCie10 } = require('../controllers/cie10.controller');

const router = Router();
router.get('/', searchCie10);

module.exports = router;
