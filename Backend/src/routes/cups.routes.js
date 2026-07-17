const { Router } = require('express');
const { searchCups, createCups, updateCups, setEstadoCups } = require('../controllers/cups.controller');

const router = Router();
router.get('/', searchCups);
router.post('/', createCups);
router.put('/:id', updateCups);
router.patch('/:id/estado', setEstadoCups);

module.exports = router;
