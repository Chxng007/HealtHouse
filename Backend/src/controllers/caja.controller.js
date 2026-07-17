const facturacionService = require('../services/facturacion.service');
const { writeAuditLog } = require('../utils/audit');
const { cierreCajaSchema } = require('../validators/facturacion.schema');
const prisma = require('../config/prisma');

function invalido(res, parsed) {
  return res.status(400).json({ error: 'Datos inválidos', detalles: parsed.error.flatten().fieldErrors });
}

async function getResumenCaja(req, res, next) {
  try {
    res.json(await facturacionService.getResumenCaja({ sedeId: req.query.sedeId }));
  } catch (err) {
    next(err);
  }
}

async function crearCierreCaja(req, res, next) {
  try {
    const parsed = cierreCajaSchema.safeParse(req.body);
    if (!parsed.success) return invalido(res, parsed);
    const cierre = await facturacionService.crearCierreCaja(parsed.data);
    await writeAuditLog(prisma, {
      accion: 'CERRAR_CAJA',
      entidad: 'CierreCaja',
      entidadId: cierre.id,
      detalle: { sede: cierre.sede.nombre, totalCaja: cierre.totalCaja },
    });
    res.status(201).json(cierre);
  } catch (err) {
    next(err);
  }
}

module.exports = { getResumenCaja, crearCierreCaja };
