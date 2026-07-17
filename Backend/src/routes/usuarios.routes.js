const { Router } = require('express');
const { uploadFoto } = require('../config/multer');
const {
  parseJsonPayload,
  listUsuarios,
  getUsuario,
  createUsuario,
  updateUsuario,
  setEstadoUsuario,
  uploadFotoUsuario,
  aplicarPlantillaUsuario,
} = require('../controllers/usuarios.controller');

const router = Router();

router.get('/', listUsuarios);
router.get('/:id', getUsuario);
router.post('/', uploadFoto.single('foto'), parseJsonPayload, createUsuario);
router.put('/:id', uploadFoto.single('foto'), parseJsonPayload, updateUsuario);
router.patch('/:id/estado', setEstadoUsuario);
router.post('/:id/foto', uploadFoto.single('foto'), uploadFotoUsuario);
router.post('/:id/aplicar-plantilla', aplicarPlantillaUsuario);

module.exports = router;
