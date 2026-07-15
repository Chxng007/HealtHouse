const { Router } = require('express');
const rolesRoutes = require('./roles.routes');
const sedesRoutes = require('./sedes.routes');
const usuariosRoutes = require('./usuarios.routes');

const router = Router();

router.use('/roles', rolesRoutes);
router.use('/sedes', sedesRoutes);
router.use('/usuarios', usuariosRoutes);

module.exports = router;
