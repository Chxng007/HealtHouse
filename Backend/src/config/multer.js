const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads', 'fotos');
const FIRMAS_DIR = path.join(__dirname, '..', '..', 'uploads', 'firmas');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(new Error('Formato de imagen no soportado. Use JPG, PNG o WEBP.'));
  }
  cb(null, true);
}

const uploadFoto = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});

const firmaStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, FIRMAS_DIR),
  filename: (req, file, cb) => cb(null, `${crypto.randomUUID()}.png`),
});

function firmaFileFilter(req, file, cb) {
  if (file.mimetype !== 'image/png') {
    return cb(new Error('La firma debe enviarse como imagen PNG.'));
  }
  cb(null, true);
}

const uploadFirma = multer({
  storage: firmaStorage,
  fileFilter: firmaFileFilter,
  limits: { fileSize: 512 * 1024 },
});

module.exports = { uploadFoto, uploadFirma, UPLOADS_DIR, FIRMAS_DIR };
