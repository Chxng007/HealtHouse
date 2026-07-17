const historiaClinicaService = require('../services/historiaClinica.service');
const { writeAuditLog } = require('../utils/audit');
const { createAtencionSchema, updateAtencionSchema, anularAtencionSchema } = require('../validators/atenciones.schema');
const prisma = require('../config/prisma');

function invalido(res, parsed) {
  return res.status(400).json({ error: 'Datos inválidos', detalles: parsed.error.flatten().fieldErrors });
}

function nombrePaciente(atencion) {
  return `${atencion.paciente.nombres} ${atencion.paciente.apellidos}`;
}

async function listAtenciones(req, res, next) {
  try {
    res.json(await historiaClinicaService.listAtenciones({ pacienteId: req.query.pacienteId, medicoId: req.query.medicoId }));
  } catch (err) {
    next(err);
  }
}

async function getAtencion(req, res, next) {
  try {
    res.json(await historiaClinicaService.getAtencionById(req.params.id));
  } catch (err) {
    next(err);
  }
}

async function getTrazabilidadAtencion(req, res, next) {
  try {
    res.json(await historiaClinicaService.getTrazabilidad(req.params.id));
  } catch (err) {
    next(err);
  }
}

async function createAtencion(req, res, next) {
  try {
    const parsed = createAtencionSchema.safeParse(req.body);
    if (!parsed.success) return invalido(res, parsed);
    const atencion = await historiaClinicaService.createAtencion(parsed.data);
    await writeAuditLog(prisma, {
      accion: 'CREAR_ATENCION',
      entidad: 'Atencion',
      entidadId: atencion.id,
      detalle: { paciente: nombrePaciente(atencion), motivoConsulta: atencion.motivoConsulta },
    });
    res.status(201).json(atencion);
  } catch (err) {
    next(err);
  }
}

async function updateAtencion(req, res, next) {
  try {
    const parsed = updateAtencionSchema.safeParse(req.body);
    if (!parsed.success) return invalido(res, parsed);
    const atencion = await historiaClinicaService.updateAtencion(req.params.id, parsed.data);
    await writeAuditLog(prisma, {
      accion: 'EDITAR_ATENCION',
      entidad: 'Atencion',
      entidadId: atencion.id,
      detalle: { paciente: nombrePaciente(atencion) },
    });
    res.json(atencion);
  } catch (err) {
    next(err);
  }
}

async function cerrarAtencion(req, res, next) {
  try {
    const atencion = await historiaClinicaService.cerrarAtencion(req.params.id);
    await writeAuditLog(prisma, {
      accion: 'CERRAR_ATENCION',
      entidad: 'Atencion',
      entidadId: atencion.id,
      detalle: { paciente: nombrePaciente(atencion) },
    });
    res.json(atencion);
  } catch (err) {
    next(err);
  }
}

async function anularAtencion(req, res, next) {
  try {
    const parsed = anularAtencionSchema.safeParse(req.body);
    if (!parsed.success) return invalido(res, parsed);
    const atencion = await historiaClinicaService.anularAtencion(req.params.id, parsed.data.motivo);
    await writeAuditLog(prisma, {
      accion: 'ANULAR_ATENCION',
      entidad: 'Atencion',
      entidadId: atencion.id,
      detalle: { paciente: nombrePaciente(atencion), motivo: parsed.data.motivo },
    });
    res.json(atencion);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listAtenciones,
  getAtencion,
  getTrazabilidadAtencion,
  createAtencion,
  updateAtencion,
  cerrarAtencion,
  anularAtencion,
};
