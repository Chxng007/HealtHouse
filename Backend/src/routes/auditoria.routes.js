const { Router } = require('express');
const { listAuditLogs, listEntidades, listAcciones } = require('../controllers/auditoria.controller');

const router = Router();
router.get('/', listAuditLogs);
router.get('/entidades', listEntidades);
router.get('/acciones', listAcciones);

module.exports = router;
