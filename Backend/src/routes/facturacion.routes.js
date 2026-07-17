const { Router } = require('express');
const {
  listFacturas,
  getStatsFacturas,
  getFactura,
  createFactura,
  emitirFactura,
  setEstadoFactura,
  crearNotaFactura,
  registrarPago,
} = require('../controllers/facturacion.controller');

const router = Router();

router.get('/', listFacturas);
router.get('/stats', getStatsFacturas);
router.get('/:id', getFactura);
router.post('/', createFactura);
router.post('/:id/emitir', emitirFactura);
router.patch('/:id/estado', setEstadoFactura);
router.post('/:id/notas', crearNotaFactura);
router.post('/:id/pagos', registrarPago);

module.exports = router;
