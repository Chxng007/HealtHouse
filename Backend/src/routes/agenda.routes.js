const { Router } = require('express');
const {
  listCitas,
  getCitasHoy,
  getCita,
  createCita,
  reprogramarCita,
  setEstadoCita,
} = require('../controllers/agenda.controller');

const router = Router();

router.get('/', listCitas);
router.get('/hoy', getCitasHoy);
router.get('/:id', getCita);
router.post('/', createCita);
router.put('/:id/reprogramar', reprogramarCita);
router.patch('/:id/estado', setEstadoCita);

module.exports = router;
