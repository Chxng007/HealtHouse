const ripsService = require('../services/rips.service');
const { writeAuditLog } = require('../utils/audit');
const { generarRipsSchema } = require('../validators/rips.schema');
const prisma = require('../config/prisma');

async function listRips(req, res, next) {
  try {
    res.json(await ripsService.listRips());
  } catch (err) {
    next(err);
  }
}

async function getRips(req, res, next) {
  try {
    res.json(await ripsService.getRips(req.params.id));
  } catch (err) {
    next(err);
  }
}

async function generarRips(req, res, next) {
  try {
    const parsed = generarRipsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Datos inválidos', detalles: parsed.error.flatten().fieldErrors });
    }
    const rips = await ripsService.generarRips(parsed.data);
    await writeAuditLog(prisma, {
      accion: 'GENERAR_RIPS',
      entidad: 'RipsExport',
      entidadId: rips.id,
      detalle: { totalRegistros: rips.totalRegistros, estado: rips.estado },
    });
    res.status(201).json(rips);
  } catch (err) {
    next(err);
  }
}

module.exports = { listRips, getRips, generarRips };
