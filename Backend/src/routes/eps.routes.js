const { Router } = require('express');
const { listEps, createEps, updateEps, setEstadoEps } = require('../controllers/eps.controller');

const router = Router();

router.get('/', listEps);
router.post('/', createEps);
router.put('/:id', updateEps);
router.patch('/:id/estado', setEstadoEps);

module.exports = router;
