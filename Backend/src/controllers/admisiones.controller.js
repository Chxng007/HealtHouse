const admisionesService = require('../services/admisiones.service');
const { writeAuditLog } = require('../utils/audit');
const { createAdmisionSchema, estadoAdmisionSchema } = require('../validators/admisiones.schema');
const prisma = require('../config/prisma');

function invalido(res, parsed) {
  return res.status(400).json({ error: 'Datos inválidos', detalles: parsed.error.flatten().fieldErrors });
}

async function listAdmisiones(req, res, next) {
  try {
    res.json(await admisionesService.listAdmisiones({ sedeId: req.query.sedeId, estado: req.query.estado }));
  } catch (err) {
    next(err);
  }
}

async function getListaEspera(req, res, next) {
  try {
    res.json(await admisionesService.listaEspera({ sedeId: req.query.sedeId }));
  } catch (err) {
    next(err);
  }
}

async function createAdmision(req, res, next) {
  try {
    const parsed = createAdmisionSchema.safeParse(req.body);
    if (!parsed.success) return invalido(res, parsed);
    const admision = await admisionesService.createAdmision(parsed.data);
    await writeAuditLog(prisma, {
      accion: 'CREAR_ADMISION',
      entidad: 'Admision',
      entidadId: admision.id,
      detalle: {
        paciente: admision.paciente.numeroDocumento,
        tipoAtencion: admision.tipoAtencion,
        citaId: admision.citaId,
      },
    });
    res.status(201).json(admision);
  } catch (err) {
    next(err);
  }
}

async function setEstadoAdmision(req, res, next) {
  try {
    const parsed = estadoAdmisionSchema.safeParse(req.body);
    if (!parsed.success) return invalido(res, parsed);
    const admision = await admisionesService.setEstado(req.params.id, parsed.data.estado);
    await writeAuditLog(prisma, {
      accion: `ADMISION_${parsed.data.estado.toUpperCase()}`,
      entidad: 'Admision',
      entidadId: admision.id,
      detalle: null,
    });
    res.json(admision);
  } catch (err) {
    next(err);
  }
}

module.exports = { listAdmisiones, getListaEspera, createAdmision, setEstadoAdmision };
