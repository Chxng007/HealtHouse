const { Router } = require('express');
const rolesRoutes = require('./roles.routes');
const sedesRoutes = require('./sedes.routes');
const usuariosRoutes = require('./usuarios.routes');
const epsRoutes = require('./eps.routes');
const pacientesRoutes = require('./pacientes.routes');
const agendaRoutes = require('./agenda.routes');
const { especialidadesRouter, consultoriosRouter, medicosRouter } = require('./catalogosAgenda.routes');

const router = Router();

router.use('/roles', rolesRoutes);
router.use('/sedes', sedesRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/eps', epsRoutes);
router.use('/pacientes', pacientesRoutes);
router.use('/citas', agendaRoutes);
router.use('/admisiones', require('./admisiones.routes'));
router.use('/especialidades', especialidadesRouter);
router.use('/consultorios', consultoriosRouter);
router.use('/medicos', medicosRouter);

module.exports = router;
