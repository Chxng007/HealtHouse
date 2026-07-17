const prisma = require('../config/prisma');
const { writeAuditLog } = require('../utils/audit');
const { epsSchema, estadoSchema } = require('../validators/parametrizacion.schema');

function invalido(res, parsed) {
  return res.status(400).json({ error: 'Datos inválidos', detalles: parsed.error.flatten().fieldErrors });
}

async function listEps(req, res, next) {
  try {
    const eps = await prisma.eps.findMany({
      where: req.query.todas === 'true' ? undefined : { activa: true },
      orderBy: { nombre: 'asc' },
    });
    res.json(eps);
  } catch (err) {
    next(err);
  }
}

async function createEps(req, res, next) {
  try {
    const parsed = epsSchema.safeParse(req.body);
    if (!parsed.success) return invalido(res, parsed);
    const eps = await prisma.eps.create({ data: parsed.data });
    await writeAuditLog(prisma, { accion: 'CREAR_EPS', entidad: 'Eps', entidadId: eps.id, detalle: { nombre: eps.nombre } });
    res.status(201).json(eps);
  } catch (err) {
    next(err);
  }
}

async function updateEps(req, res, next) {
  try {
    const parsed = epsSchema.safeParse(req.body);
    if (!parsed.success) return invalido(res, parsed);
    const eps = await prisma.eps.update({ where: { id: req.params.id }, data: parsed.data });
    await writeAuditLog(prisma, { accion: 'EDITAR_EPS', entidad: 'Eps', entidadId: eps.id, detalle: { nombre: eps.nombre } });
    res.json(eps);
  } catch (err) {
    next(err);
  }
}

async function setEstadoEps(req, res, next) {
  try {
    const parsed = estadoSchema.safeParse(req.body);
    if (!parsed.success) return invalido(res, parsed);
    const eps = await prisma.eps.update({ where: { id: req.params.id }, data: { activa: parsed.data.activo } });
    await writeAuditLog(prisma, {
      accion: parsed.data.activo ? 'ACTIVAR_EPS' : 'DESACTIVAR_EPS',
      entidad: 'Eps',
      entidadId: eps.id,
      detalle: null,
    });
    res.json(eps);
  } catch (err) {
    next(err);
  }
}

module.exports = { listEps, createEps, updateEps, setEstadoEps };
