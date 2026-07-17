const { Router } = require('express');
const {
  listAtenciones,
  getAtencion,
  getTrazabilidadAtencion,
  createAtencion,
  updateAtencion,
  cerrarAtencion,
  anularAtencion,
} = require('../controllers/atenciones.controller');

const router = Router();

router.get('/', listAtenciones);
router.get('/:id', getAtencion);
router.get('/:id/trazabilidad', getTrazabilidadAtencion);
router.post('/', createAtencion);
router.put('/:id', updateAtencion);
router.post('/:id/cerrar', cerrarAtencion);
router.patch('/:id/anular', anularAtencion);

module.exports = router;
