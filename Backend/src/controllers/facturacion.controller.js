const facturacionService = require('../services/facturacion.service');
const { writeAuditLog } = require('../utils/audit');
const {
  createFacturaSchema,
  estadoFacturaSchema,
  notaFacturaSchema,
  pagoSchema,
} = require('../validators/facturacion.schema');
const prisma = require('../config/prisma');

function invalido(res, parsed) {
  return res.status(400).json({ error: 'Datos inválidos', detalles: parsed.error.flatten().fieldErrors });
}

function nombrePaciente(factura) {
  return `${factura.paciente.nombres} ${factura.paciente.apellidos}`;
}

async function listFacturas(req, res, next) {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize, 10) || 10, 1), 100);
    res.json(await facturacionService.listFacturas({ estado: req.query.estado, search: req.query.search, page, pageSize }));
  } catch (err) {
    next(err);
  }
}

async function getStatsFacturas(req, res, next) {
  try {
    res.json(await facturacionService.getStats());
  } catch (err) {
    next(err);
  }
}

async function getFactura(req, res, next) {
  try {
    res.json(await facturacionService.getFactura(req.params.id));
  } catch (err) {
    next(err);
  }
}

async function createFactura(req, res, next) {
  try {
    const parsed = createFacturaSchema.safeParse(req.body);
    if (!parsed.success) return invalido(res, parsed);
    const factura = await facturacionService.createFactura(parsed.data);
    await writeAuditLog(prisma, {
      accion: 'CREAR_FACTURA_BORRADOR',
      entidad: 'Factura',
      entidadId: factura.id,
      detalle: { paciente: nombrePaciente(factura), total: factura.total },
    });
    res.status(201).json(factura);
  } catch (err) {
    next(err);
  }
}

async function emitirFactura(req, res, next) {
  try {
    const factura = await facturacionService.emitirFactura(req.params.id);
    await writeAuditLog(prisma, {
      accion: 'EMITIR_FACTURA',
      entidad: 'Factura',
      entidadId: factura.id,
      // STUB Siigo/DIAN: el número se asigna localmente; el envío real queda pendiente.
      detalle: { numero: factura.numero, estadoDian: factura.estadoDian },
    });
    res.json(factura);
  } catch (err) {
    next(err);
  }
}

async function setEstadoFactura(req, res, next) {
  try {
    const parsed = estadoFacturaSchema.safeParse(req.body);
    if (!parsed.success) return invalido(res, parsed);
    const factura = await facturacionService.setEstadoFactura(req.params.id, parsed.data.estado, parsed.data.motivo);
    await writeAuditLog(prisma, {
      accion: `FACTURA_${parsed.data.estado.toUpperCase()}`,
      entidad: 'Factura',
      entidadId: factura.id,
      detalle: { motivo: parsed.data.motivo ?? null },
    });
    res.json(factura);
  } catch (err) {
    next(err);
  }
}

async function crearNotaFactura(req, res, next) {
  try {
    const parsed = notaFacturaSchema.safeParse(req.body);
    if (!parsed.success) return invalido(res, parsed);
    const factura = await facturacionService.crearNotaFactura(req.params.id, parsed.data);
    await writeAuditLog(prisma, {
      accion: `NOTA_${parsed.data.tipo.toUpperCase()}_FACTURA`,
      entidad: 'Factura',
      entidadId: factura.id,
      detalle: { valor: parsed.data.valor, motivo: parsed.data.motivo },
    });
    res.status(201).json(factura);
  } catch (err) {
    next(err);
  }
}

async function registrarPago(req, res, next) {
  try {
    const parsed = pagoSchema.safeParse(req.body);
    if (!parsed.success) return invalido(res, parsed);
    const factura = await facturacionService.registrarPago(req.params.id, parsed.data);
    await writeAuditLog(prisma, {
      accion: 'REGISTRAR_PAGO',
      entidad: 'Factura',
      entidadId: factura.id,
      detalle: { metodo: parsed.data.metodo, valor: parsed.data.valor },
    });
    res.status(201).json(factura);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listFacturas,
  getStatsFacturas,
  getFactura,
  createFactura,
  emitirFactura,
  setEstadoFactura,
  crearNotaFactura,
  registrarPago,
};
