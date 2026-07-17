const usuariosService = require('../services/usuarios.service');
const { writeAuditLog } = require('../utils/audit');
const { createUserSchema, updateUserSchema, estadoSchema } = require('../validators/usuarios.schema');
const prisma = require('../config/prisma');

function parseJsonPayload(req, res, next) {
  if (typeof req.body?.data !== 'string') {
    return res.status(400).json({ error: 'Falta el campo "data" con el JSON del usuario.' });
  }
  try {
    req.body = JSON.parse(req.body.data);
    next();
  } catch {
    res.status(400).json({ error: 'El campo "data" no contiene un JSON válido.' });
  }
}

function fotoUrlFromFile(file) {
  return file ? `/uploads/fotos/${file.filename}` : undefined;
}

async function listUsuarios(req, res, next) {
  try {
    const usuarios = await usuariosService.listUsers({ search: req.query.search });
    res.json(usuarios);
  } catch (err) {
    next(err);
  }
}

async function getUsuario(req, res, next) {
  try {
    const usuario = await usuariosService.getUserById(req.params.id);
    res.json(usuario);
  } catch (err) {
    next(err);
  }
}

async function createUsuario(req, res, next) {
  try {
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Datos inválidos', detalles: parsed.error.flatten().fieldErrors });
    }
    const usuario = await usuariosService.createUser(parsed.data, fotoUrlFromFile(req.file));
    await writeAuditLog(prisma, {
      accion: 'CREAR_USUARIO',
      entidad: 'User',
      entidadId: usuario.id,
      detalle: { correo: usuario.correo },
    });
    res.status(201).json(usuario);
  } catch (err) {
    next(err);
  }
}

async function updateUsuario(req, res, next) {
  try {
    const parsed = updateUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Datos inválidos', detalles: parsed.error.flatten().fieldErrors });
    }
    const usuario = await usuariosService.updateUser(req.params.id, parsed.data, fotoUrlFromFile(req.file));
    await writeAuditLog(prisma, {
      accion: 'EDITAR_USUARIO',
      entidad: 'User',
      entidadId: usuario.id,
      detalle: { correo: usuario.correo },
    });
    res.json(usuario);
  } catch (err) {
    next(err);
  }
}

async function setEstadoUsuario(req, res, next) {
  try {
    const parsed = estadoSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Datos inválidos', detalles: parsed.error.flatten().fieldErrors });
    }
    const { activo, motivo } = parsed.data;
    const usuario = await usuariosService.setEstado(req.params.id, activo);
    await writeAuditLog(prisma, {
      accion: activo ? 'ACTIVAR_USUARIO' : 'DESACTIVAR_USUARIO',
      entidad: 'User',
      entidadId: usuario.id,
      detalle: { motivo: motivo ?? null },
    });
    res.json(usuario);
  } catch (err) {
    next(err);
  }
}

async function uploadFotoUsuario(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ningún archivo.' });
    }
    const usuario = await usuariosService.setFoto(req.params.id, fotoUrlFromFile(req.file));
    res.json(usuario);
  } catch (err) {
    next(err);
  }
}

async function aplicarPlantillaUsuario(req, res, next) {
  try {
    const usuario = await usuariosService.aplicarPlantillaDeRol(req.params.id);
    await writeAuditLog(prisma, {
      accion: 'APLICAR_PLANTILLA_ROL',
      entidad: 'User',
      entidadId: usuario.id,
      detalle: { rol: usuario.rol.nombre },
    });
    res.json(usuario);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  parseJsonPayload,
  listUsuarios,
  getUsuario,
  createUsuario,
  updateUsuario,
  setEstadoUsuario,
  uploadFotoUsuario,
  aplicarPlantillaUsuario,
};
