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
router.use('/atenciones', require('./atenciones.routes'));
router.use('/cie10', require('./cie10.routes'));
router.use('/cups', require('./cups.routes'));

const {
  formulasRouter, ordenesRouter, remisionesRouter, incapacidadesRouter, consentimientosRouter,
} = require('./formulasOrdenes.routes');
router.use('/formulas', formulasRouter);
router.use('/ordenes', ordenesRouter);
router.use('/remisiones', remisionesRouter);
router.use('/incapacidades', incapacidadesRouter);
router.use('/consentimientos', consentimientosRouter);

router.use('/facturas', require('./facturacion.routes'));
router.use('/caja', require('./caja.routes'));
router.use('/configuracion', require('./configuracion.routes'));
const { conveniosRouter, serviciosRouter, tarifasRouter } = require('./catalogosFacturacion.routes');
router.use('/convenios', conveniosRouter);
router.use('/servicios', serviciosRouter);
router.use('/tarifas', tarifasRouter);

router.use('/rips', require('./rips.routes'));
router.use('/auditoria', require('./auditoria.routes'));
router.use('/dashboard', require('./dashboard.routes'));
router.use('/reportes', require('./reportes.routes'));

module.exports = router;
