const { Router } = require('express');
const { listRoles, getPermisosDeRol, setPermisosDeRol } = require('../controllers/roles.controller');

const router = Router();

router.get('/', listRoles);
router.get('/:id/permisos', getPermisosDeRol);
router.put('/:id/permisos', setPermisosDeRol);

module.exports = router;
