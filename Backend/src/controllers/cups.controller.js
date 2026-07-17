const prisma = require('../config/prisma');
const { writeAuditLog } = require('../utils/audit');
const { cupsSchema, estadoSchema } = require('../validators/parametrizacion.schema');

function invalido(res, parsed) {
  return res.status(400).json({ error: 'Datos inválidos', detalles: parsed.error.flatten().fieldErrors });
}

async function searchCups(req, res, next) {
  try {
    const search = (req.query.search ?? '').trim();
    const codigos = await prisma.cups.findMany({
      where: {
        ...(req.query.todas === 'true' ? {} : { activo: true }),
        ...(search
          ? {
              OR: [
                { codigo: { contains: search, mode: 'insensitive' } },
                { nombre: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { codigo: 'asc' },
      take: req.query.todas === 'true' ? undefined : 20,
    });
    res.json(codigos);
  } catch (err) {
    next(err);
  }
}

async function createCups(req, res, next) {
  try {
    const parsed = cupsSchema.safeParse(req.body);
    if (!parsed.success) return invalido(res, parsed);
    const cups = await prisma.cups.create({ data: parsed.data });
    await writeAuditLog(prisma, { accion: 'CREAR_CUPS', entidad: 'Cups', entidadId: cups.id, detalle: { codigo: cups.codigo } });
    res.status(201).json(cups);
  } catch (err) {
    next(err);
  }
}

async function updateCups(req, res, next) {
  try {
    const parsed = cupsSchema.safeParse(req.body);
    if (!parsed.success) return invalido(res, parsed);
    const cups = await prisma.cups.update({ where: { id: req.params.id }, data: parsed.data });
    await writeAuditLog(prisma, { accion: 'EDITAR_CUPS', entidad: 'Cups', entidadId: cups.id, detalle: { codigo: cups.codigo } });
    res.json(cups);
  } catch (err) {
    next(err);
  }
}

async function setEstadoCups(req, res, next) {
  try {
    const parsed = estadoSchema.safeParse(req.body);
    if (!parsed.success) return invalido(res, parsed);
    const cups = await prisma.cups.update({ where: { id: req.params.id }, data: { activo: parsed.data.activo } });
    await writeAuditLog(prisma, {
      accion: parsed.data.activo ? 'ACTIVAR_CUPS' : 'DESACTIVAR_CUPS',
      entidad: 'Cups',
      entidadId: cups.id,
      detalle: null,
    });
    res.json(cups);
  } catch (err) {
    next(err);
  }
}

module.exports = { searchCups, createCups, updateCups, setEstadoCups };
