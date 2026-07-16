const multer = require('multer');
const { Prisma } = require('@prisma/client');

const UNIQUE_FIELD_LABELS = {
  correo: 'El correo electrónico ya está registrado.',
  numeroDocumento: 'El número de documento ya está registrado.',
};

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }

  if (err.message === 'Formato de imagen no soportado. Use JPG, PNG o WEBP.') {
    return res.status(400).json({ error: err.message });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const field = Array.isArray(err.meta?.target) ? err.meta.target[0] : err.meta?.target;
      return res.status(409).json({ error: UNIQUE_FIELD_LABELS[field] ?? 'El registro ya existe.' });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Registro no encontrado.' });
    }
    if (err.code === 'P2003') {
      return res.status(400).json({ error: 'Referencia inválida (registro relacionado inexistente).' });
    }
  }

  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }

  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
}

module.exports = { errorHandler };
