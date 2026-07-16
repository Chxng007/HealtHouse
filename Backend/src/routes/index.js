const { Router } = require('express');
const rolesRoutes = require('./roles.routes');
const sedesRoutes = require('./sedes.routes');
const usuariosRoutes = require('./usuarios.routes');
const epsRoutes = require('./eps.routes');
const pacientesRoutes = require('./pacientes.routes');

const router = Router();

router.use('/roles', rolesRoutes);
router.use('/sedes', sedesRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/eps', epsRoutes);
router.use('/pacientes', pacientesRoutes);

module.exports = router;
