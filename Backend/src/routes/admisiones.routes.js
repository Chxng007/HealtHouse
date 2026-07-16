const { Router } = require('express');
const {
  listAdmisiones,
  getListaEspera,
  createAdmision,
  setEstadoAdmision,
} = require('../controllers/admisiones.controller');

const router = Router();

router.get('/', listAdmisiones);
router.get('/espera', getListaEspera);
router.post('/', createAdmision);
router.patch('/:id/estado', setEstadoAdmision);

module.exports = router;
