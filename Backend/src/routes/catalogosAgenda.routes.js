const { Router } = require('express');
const {
  listEspecialidades, createEspecialidad, updateEspecialidad, setEstadoEspecialidad,
  listConsultorios, createConsultorio, updateConsultorio, setEstadoConsultorio,
  listMedicos,
} = require('../controllers/catalogosAgenda.controller');

const especialidadesRouter = Router();
especialidadesRouter.get('/', listEspecialidades);
especialidadesRouter.post('/', createEspecialidad);
especialidadesRouter.put('/:id', updateEspecialidad);
especialidadesRouter.patch('/:id/estado', setEstadoEspecialidad);

const consultoriosRouter = Router();
consultoriosRouter.get('/', listConsultorios);
consultoriosRouter.post('/', createConsultorio);
consultoriosRouter.put('/:id', updateConsultorio);
consultoriosRouter.patch('/:id/estado', setEstadoConsultorio);

const medicosRouter = Router();
medicosRouter.get('/', listMedicos);

module.exports = { especialidadesRouter, consultoriosRouter, medicosRouter };
