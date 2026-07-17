const service = require('../services/formulasOrdenes.service');
const { writeAuditLog } = require('../utils/audit');
const {
  createFormulaSchema,
  createOrdenSchema,
  createRemisionSchema,
  createIncapacidadSchema,
  createConsentimientoSchema,
  anularSchema,
} = require('../validators/formulasOrdenes.schema');
const prisma = require('../config/prisma');

function invalido(res, parsed) {
  return res.status(400).json({ error: 'Datos inválidos', detalles: parsed.error.flatten().fieldErrors });
}

function nombrePaciente(doc) {
  return `${doc.paciente.nombres} ${doc.paciente.apellidos}`;
}

function crudDocumento({ schema, entidad, accionCrear, accionAnular, list, get, create, anular }) {
  return {
    async list(req, res, next) {
      try {
        res.json(await list({ pacienteId: req.query.pacienteId }));
      } catch (err) {
        next(err);
      }
    },
    async getOne(req, res, next) {
      try {
        res.json(await get(req.params.id));
      } catch (err) {
        next(err);
      }
    },
    async createOne(req, res, next) {
      try {
        const parsed = schema.safeParse(req.body);
        if (!parsed.success) return invalido(res, parsed);
        const doc = await create(parsed.data);
        await writeAuditLog(prisma, {
          accion: accionCrear,
          entidad,
          entidadId: doc.id,
          detalle: { paciente: nombrePaciente(doc) },
        });
        res.status(201).json(doc);
      } catch (err) {
        next(err);
      }
    },
    async anularOne(req, res, next) {
      try {
        const parsed = anularSchema.safeParse(req.body);
        if (!parsed.success) return invalido(res, parsed);
        const doc = await anular(req.params.id, parsed.data.motivo);
        await writeAuditLog(prisma, {
          accion: accionAnular,
          entidad,
          entidadId: doc.id,
          detalle: { paciente: nombrePaciente(doc), motivo: parsed.data.motivo },
        });
        res.json(doc);
      } catch (err) {
        next(err);
      }
    },
  };
}

const formulas = crudDocumento({
  schema: createFormulaSchema,
  entidad: 'Formula',
  accionCrear: 'EMITIR_FORMULA',
  accionAnular: 'ANULAR_FORMULA',
  list: service.listFormulas,
  get: service.getFormula,
  create: service.createFormula,
  anular: service.anularFormula,
});

const ordenes = crudDocumento({
  schema: createOrdenSchema,
  entidad: 'Orden',
  accionCrear: 'EMITIR_ORDEN',
  accionAnular: 'ANULAR_ORDEN',
  list: service.listOrdenes,
  get: service.getOrden,
  create: service.createOrden,
  anular: service.anularOrden,
});

const remisiones = crudDocumento({
  schema: createRemisionSchema,
  entidad: 'Remision',
  accionCrear: 'EMITIR_REMISION',
  accionAnular: 'ANULAR_REMISION',
  list: service.listRemisiones,
  get: service.getRemision,
  create: service.createRemision,
  anular: service.anularRemision,
});

const incapacidades = crudDocumento({
  schema: createIncapacidadSchema,
  entidad: 'Incapacidad',
  accionCrear: 'EMITIR_INCAPACIDAD',
  accionAnular: 'ANULAR_INCAPACIDAD',
  list: service.listIncapacidades,
  get: service.getIncapacidad,
  create: service.createIncapacidad,
  anular: service.anularIncapacidad,
});

const consentimientosBase = crudDocumento({
  schema: createConsentimientoSchema,
  entidad: 'Consentimiento',
  accionCrear: 'CREAR_CONSENTIMIENTO',
  accionAnular: 'ANULAR_CONSENTIMIENTO',
  list: service.listConsentimientos,
  get: service.getConsentimiento,
  create: service.createConsentimiento,
  anular: service.anularConsentimiento,
});

async function firmarConsentimiento(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Falta el archivo de la firma (PNG).' });
    }
    const firmaUrl = `/uploads/firmas/${req.file.filename}`;
    const doc = await service.firmarConsentimiento(req.params.id, firmaUrl);
    await writeAuditLog(prisma, {
      accion: 'FIRMAR_CONSENTIMIENTO',
      entidad: 'Consentimiento',
      entidadId: doc.id,
      detalle: { paciente: nombrePaciente(doc), firmante: doc.firmante },
    });
    res.json(doc);
  } catch (err) {
    next(err);
  }
}

const consentimientos = { ...consentimientosBase, firmarConsentimiento };

module.exports = { formulas, ordenes, remisiones, incapacidades, consentimientos };
