const sedesService = require('../services/sedes.service');
const { writeAuditLog } = require('../utils/audit');
const { sedeSchema, estadoSchema } = require('../validators/parametrizacion.schema');
const prisma = require('../config/prisma');

function invalido(res, parsed) {
  return res.status(400).json({ error: 'Datos inválidos', detalles: parsed.error.flatten().fieldErrors });
}

async function listSedes(req, res, next) {
  try {
    res.json(await sedesService.listSedes({ todas: req.query.todas === 'true' }));
  } catch (err) {
    next(err);
  }
}

async function createSede(req, res, next) {
  try {
    const parsed = sedeSchema.safeParse(req.body);
    if (!parsed.success) return invalido(res, parsed);
    const sede = await sedesService.createSede(parsed.data);
    await writeAuditLog(prisma, { accion: 'CREAR_SEDE', entidad: 'Sede', entidadId: sede.id, detalle: { nombre: sede.nombre } });
    res.status(201).json(sede);
  } catch (err) {
    next(err);
  }
}

async function updateSede(req, res, next) {
  try {
    const parsed = sedeSchema.safeParse(req.body);
    if (!parsed.success) return invalido(res, parsed);
    const sede = await sedesService.updateSede(req.params.id, parsed.data);
    await writeAuditLog(prisma, { accion: 'EDITAR_SEDE', entidad: 'Sede', entidadId: sede.id, detalle: { nombre: sede.nombre } });
    res.json(sede);
  } catch (err) {
    next(err);
  }
}

async function setEstadoSede(req, res, next) {
  try {
    const parsed = estadoSchema.safeParse(req.body);
    if (!parsed.success) return invalido(res, parsed);
    const sede = await sedesService.setEstado(req.params.id, parsed.data.activo);
    await writeAuditLog(prisma, {
      accion: parsed.data.activo ? 'ACTIVAR_SEDE' : 'DESACTIVAR_SEDE',
      entidad: 'Sede',
      entidadId: sede.id,
      detalle: null,
    });
    res.json(sede);
  } catch (err) {
    next(err);
  }
}

module.exports = { listSedes, createSede, updateSede, setEstadoSede };
