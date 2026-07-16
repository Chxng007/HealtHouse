const { Router } = require('express');
const { uploadFoto } = require('../config/multer');
const {
  parseJsonPayload,
  listPacientes,
  getStatsPacientes,
  getPaciente,
  getHistorialPaciente,
  createPaciente,
  updatePaciente,
  setEstadoPaciente,
} = require('../controllers/pacientes.controller');

const router = Router();

router.get('/', listPacientes);
router.get('/stats', getStatsPacientes);
router.get('/:id', getPaciente);
router.get('/:id/historial', getHistorialPaciente);
router.post('/', uploadFoto.single('foto'), parseJsonPayload, createPaciente);
router.put('/:id', uploadFoto.single('foto'), parseJsonPayload, updatePaciente);
router.patch('/:id/estado', setEstadoPaciente);

module.exports = router;
