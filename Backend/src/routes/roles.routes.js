const { Router } = require('express');
const { listRoles } = require('../controllers/roles.controller');

const router = Router();

router.get('/', listRoles);

module.exports = router;
