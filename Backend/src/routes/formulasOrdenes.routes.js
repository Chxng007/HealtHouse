const { Router } = require('express');
const { uploadFirma } = require('../config/multer');
const { formulas, ordenes, remisiones, incapacidades, consentimientos } = require('../controllers/formulasOrdenes.controller');

function crudRouter(handlers) {
  const router = Router();
  router.get('/', handlers.list);
  router.get('/:id', handlers.getOne);
  router.post('/', handlers.createOne);
  router.patch('/:id/anular', handlers.anularOne);
  return router;
}

const formulasRouter = crudRouter(formulas);
const ordenesRouter = crudRouter(ordenes);
const remisionesRouter = crudRouter(remisiones);
const incapacidadesRouter = crudRouter(incapacidades);

const consentimientosRouter = crudRouter(consentimientos);
consentimientosRouter.post('/:id/firmar', uploadFirma.single('firma'), consentimientos.firmarConsentimiento);

module.exports = { formulasRouter, ordenesRouter, remisionesRouter, incapacidadesRouter, consentimientosRouter };
