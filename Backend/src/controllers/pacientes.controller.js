const pacientesService = require('../services/pacientes.service');
const { writeAuditLog } = require('../utils/audit');
const { createPacienteSchema, updatePacienteSchema, estadoSchema } = require('../validators/pacientes.schema');
const prisma = require('../config/prisma');

function parseJsonPayload(req, res, next) {
  if (typeof req.body?.data !== 'string') {
    return res.status(400).json({ error: 'Falta el campo "data" con el JSON del paciente.' });
  }
  try {
    req.body = JSON.parse(req.body.data);
    next();
  } catch {
    res.status(400).json({ error: 'El campo "data" no contiene un JSON válido.' });
  }
}

function fotoUrlFromFile(file) {
  return file ? `/uploads/fotos/${file.filename}` : undefined;
}

async function listPacientes(req, res, next) {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize, 10) || 10, 1), 100);
    const resultado = await pacientesService.listPacientes({
      search: req.query.search,
      documento: req.query.documento,
      epsId: req.query.epsId,
      page,
      pageSize,
    });
    res.json(resultado);
  } catch (err) {
    next(err);
  }
}

async function getStatsPacientes(req, res, next) {
  try {
    res.json(await pacientesService.getStats());
  } catch (err) {
    next(err);
  }
}

async function getPaciente(req, res, next) {
  try {
    res.json(await pacientesService.getPacienteById(req.params.id));
  } catch (err) {
    next(err);
  }
}

async function getHistorialPaciente(req, res, next) {
  try {
    res.json(await pacientesService.getHistorial(req.params.id));
  } catch (err) {
    next(err);
  }
}

async function createPaciente(req, res, next) {
  try {
    const parsed = createPacienteSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Datos inválidos', detalles: parsed.error.flatten().fieldErrors });
    }
    const paciente = await pacientesService.createPaciente(parsed.data, fotoUrlFromFile(req.file));
    await writeAuditLog(prisma, {
      accion: 'CREAR_PACIENTE',
      entidad: 'Paciente',
      entidadId: paciente.id,
      detalle: { numeroDocumento: paciente.numeroDocumento },
    });
    res.status(201).json(paciente);
  } catch (err) {
    next(err);
  }
}

async function updatePaciente(req, res, next) {
  try {
    const parsed = updatePacienteSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Datos inválidos', detalles: parsed.error.flatten().fieldErrors });
    }
    const paciente = await pacientesService.updatePaciente(req.params.id, parsed.data, fotoUrlFromFile(req.file));
    await writeAuditLog(prisma, {
      accion: 'EDITAR_PACIENTE',
      entidad: 'Paciente',
      entidadId: paciente.id,
      detalle: { numeroDocumento: paciente.numeroDocumento },
    });
    res.json(paciente);
  } catch (err) {
    next(err);
  }
}

async function setEstadoPaciente(req, res, next) {
  try {
    const parsed = estadoSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Datos inválidos', detalles: parsed.error.flatten().fieldErrors });
    }
    const { activo, motivo } = parsed.data;
    const paciente = await pacientesService.setEstado(req.params.id, activo);
    await writeAuditLog(prisma, {
      accion: activo ? 'ACTIVAR_PACIENTE' : 'DESACTIVAR_PACIENTE',
      entidad: 'Paciente',
      entidadId: paciente.id,
      detalle: { motivo: motivo ?? null },
    });
    res.json(paciente);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  parseJsonPayload,
  listPacientes,
  getStatsPacientes,
  getPaciente,
  getHistorialPaciente,
  createPaciente,
  updatePaciente,
  setEstadoPaciente,
};
