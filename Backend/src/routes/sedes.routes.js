const { Router } = require('express');
const { listSedes, createSede, updateSede, setEstadoSede } = require('../controllers/sedes.controller');

const router = Router();

router.get('/', listSedes);
router.post('/', createSede);
router.put('/:id', updateSede);
router.patch('/:id/estado', setEstadoSede);

module.exports = router;
