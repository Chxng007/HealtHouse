const { Router } = require('express');
const { listEspecialidades, listConsultorios, listMedicos } = require('../controllers/catalogosAgenda.controller');

const especialidadesRouter = Router();
especialidadesRouter.get('/', listEspecialidades);

const consultoriosRouter = Router();
consultoriosRouter.get('/', listConsultorios);

const medicosRouter = Router();
medicosRouter.get('/', listMedicos);

module.exports = { especialidadesRouter, consultoriosRouter, medicosRouter };
