const rolesService = require('../services/roles.service');
const { writeAuditLog } = require('../utils/audit');
const { setPermisosRolSchema } = require('../validators/roles.schema');
const prisma = require('../config/prisma');

async function listRoles(req, res, next) {
  try {
    res.json(await rolesService.listRoles());
  } catch (err) {
    next(err);
  }
}

async function getPermisosDeRol(req, res, next) {
  try {
    res.json(await rolesService.getPermisosDeRol(req.params.id));
  } catch (err) {
    next(err);
  }
}

async function setPermisosDeRol(req, res, next) {
  try {
    const parsed = setPermisosRolSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Datos inválidos', detalles: parsed.error.flatten().fieldErrors });
    }
    const permisos = await rolesService.setPermisosDeRol(req.params.id, parsed.data.permisos);
    await writeAuditLog(prisma, {
      accion: 'ACTUALIZAR_PERMISOS_ROL',
      entidad: 'Role',
      entidadId: req.params.id,
      detalle: null,
    });
    res.json(permisos);
  } catch (err) {
    next(err);
  }
}

module.exports = { listRoles, getPermisosDeRol, setPermisosDeRol };
