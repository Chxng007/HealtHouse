const agendaService = require('../services/agenda.service');
const { writeAuditLog } = require('../utils/audit');
const { createCitaSchema, reprogramarCitaSchema, estadoCitaSchema } = require('../validators/citas.schema');
const prisma = require('../config/prisma');

function invalido(res, parsed) {
  return res.status(400).json({ error: 'Datos inválidos', detalles: parsed.error.flatten().fieldErrors });
}

async function listCitas(req, res, next) {
  try {
    const { desde, hasta, medicoId, sedeId, consultorioId, estado, pacienteId } = req.query;
    const citas = await agendaService.listCitas({
      desde: desde ? new Date(desde) : undefined,
      hasta: hasta ? new Date(hasta) : undefined,
      medicoId,
      sedeId,
      consultorioId,
      estado,
      pacienteId,
    });
    res.json(citas);
  } catch (err) {
    next(err);
  }
}

async function getCitasHoy(req, res, next) {
  try {
    res.json(await agendaService.citasDeHoy({ sedeId: req.query.sedeId }));
  } catch (err) {
    next(err);
  }
}

async function getCita(req, res, next) {
  try {
    res.json(await agendaService.getCitaById(req.params.id));
  } catch (err) {
    next(err);
  }
}

async function createCita(req, res, next) {
  try {
    const parsed = createCitaSchema.safeParse(req.body);
    if (!parsed.success) return invalido(res, parsed);
    const cita = await agendaService.createCita(parsed.data);
    await writeAuditLog(prisma, {
      accion: 'CREAR_CITA',
      entidad: 'Cita',
      entidadId: cita.id,
      detalle: { paciente: cita.paciente.numeroDocumento, inicio: cita.inicio },
    });
    res.status(201).json(cita);
  } catch (err) {
    next(err);
  }
}

async function reprogramarCita(req, res, next) {
  try {
    const parsed = reprogramarCitaSchema.safeParse(req.body);
    if (!parsed.success) return invalido(res, parsed);
    const cita = await agendaService.reprogramarCita(req.params.id, parsed.data);
    await writeAuditLog(prisma, {
      accion: 'REPROGRAMAR_CITA',
      entidad: 'Cita',
      entidadId: cita.id,
      detalle: { motivo: parsed.data.motivoReprogramacion, nuevoInicio: cita.inicio },
    });
    res.json(cita);
  } catch (err) {
    next(err);
  }
}

async function setEstadoCita(req, res, next) {
  try {
    const parsed = estadoCitaSchema.safeParse(req.body);
    if (!parsed.success) return invalido(res, parsed);
    const cita = await agendaService.setEstadoCita(req.params.id, parsed.data);
    await writeAuditLog(prisma, {
      accion: `CITA_${parsed.data.estado.toUpperCase()}`,
      entidad: 'Cita',
      entidadId: cita.id,
      detalle: { motivo: parsed.data.motivoCancelacion ?? null },
    });
    res.json(cita);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listCitas,
  getCitasHoy,
  getCita,
  createCita,
  reprogramarCita,
  setEstadoCita,
};
