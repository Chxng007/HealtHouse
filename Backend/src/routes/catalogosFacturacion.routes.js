const { Router } = require('express');
const {
  listConvenios, createConvenio, setEstadoConvenio,
  listServicios, createServicio, updateServicio, setEstadoServicio,
  listTarifasDeConvenio, upsertTarifa,
} = require('../controllers/catalogosFacturacion.controller');

const conveniosRouter = Router();
conveniosRouter.get('/', listConvenios);
conveniosRouter.post('/', createConvenio);
conveniosRouter.patch('/:id/estado', setEstadoConvenio);
conveniosRouter.get('/:id/tarifas', listTarifasDeConvenio);

const serviciosRouter = Router();
serviciosRouter.get('/', listServicios);
serviciosRouter.post('/', createServicio);
serviciosRouter.put('/:id', updateServicio);
serviciosRouter.patch('/:id/estado', setEstadoServicio);

const tarifasRouter = Router();
tarifasRouter.put('/', upsertTarifa);

module.exports = { conveniosRouter, serviciosRouter, tarifasRouter };
