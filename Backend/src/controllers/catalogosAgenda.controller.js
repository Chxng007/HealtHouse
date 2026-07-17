const prisma = require('../config/prisma');
const { writeAuditLog } = require('../utils/audit');
const { especialidadSchema, consultorioSchema, estadoSchema } = require('../validators/parametrizacion.schema');

// Roles cuyo usuario puede figurar como médico tratante de una cita.
const ROLES_CLINICOS = [
  'medico-general',
  'psiquiatra',
  'psicologo',
  'neuropsicologo',
  'odontologo',
  'nutricionista',
];

function invalido(res, parsed) {
  return res.status(400).json({ error: 'Datos inválidos', detalles: parsed.error.flatten().fieldErrors });
}

const consultorioInclude = {
  sede: { select: { id: true, nombre: true } },
  especialidad: { select: { id: true, nombre: true } },
  medico: { select: { id: true, nombres: true, apellidos: true } },
};

async function listEspecialidades(req, res, next) {
  try {
    const especialidades = await prisma.especialidad.findMany({
      where: req.query.todas === 'true' ? undefined : { activa: true },
      include: { _count: { select: { consultorios: true } } },
      orderBy: { nombre: 'asc' },
    });
    res.json(especialidades);
  } catch (err) {
    next(err);
  }
}

async function createEspecialidad(req, res, next) {
  try {
    const parsed = especialidadSchema.safeParse(req.body);
    if (!parsed.success) return invalido(res, parsed);
    const especialidad = await prisma.especialidad.create({ data: parsed.data });
    await writeAuditLog(prisma, { accion: 'CREAR_ESPECIALIDAD', entidad: 'Especialidad', entidadId: especialidad.id, detalle: { nombre: especialidad.nombre } });
    res.status(201).json(especialidad);
  } catch (err) {
    next(err);
  }
}

async function updateEspecialidad(req, res, next) {
  try {
    const parsed = especialidadSchema.safeParse(req.body);
    if (!parsed.success) return invalido(res, parsed);
    const especialidad = await prisma.especialidad.update({ where: { id: req.params.id }, data: parsed.data });
    await writeAuditLog(prisma, { accion: 'EDITAR_ESPECIALIDAD', entidad: 'Especialidad', entidadId: especialidad.id, detalle: { nombre: especialidad.nombre } });
    res.json(especialidad);
  } catch (err) {
    next(err);
  }
}

async function setEstadoEspecialidad(req, res, next) {
  try {
    const parsed = estadoSchema.safeParse(req.body);
    if (!parsed.success) return invalido(res, parsed);
    const especialidad = await prisma.especialidad.update({ where: { id: req.params.id }, data: { activa: parsed.data.activo } });
    await writeAuditLog(prisma, {
      accion: parsed.data.activo ? 'ACTIVAR_ESPECIALIDAD' : 'DESACTIVAR_ESPECIALIDAD',
      entidad: 'Especialidad',
      entidadId: especialidad.id,
      detalle: null,
    });
    res.json(especialidad);
  } catch (err) {
    next(err);
  }
}

async function listConsultorios(req, res, next) {
  try {
    const consultorios = await prisma.consultorio.findMany({
      where: {
        ...(req.query.todas === 'true' ? {} : { activo: true }),
        ...(req.query.sedeId ? { sedeId: req.query.sedeId } : {}),
      },
      include: consultorioInclude,
      orderBy: [{ sedeId: 'asc' }, { nombre: 'asc' }],
    });
    res.json(consultorios);
  } catch (err) {
    next(err);
  }
}

async function createConsultorio(req, res, next) {
  try {
    const parsed = consultorioSchema.safeParse(req.body);
    if (!parsed.success) return invalido(res, parsed);
    const consultorio = await prisma.consultorio.create({
      data: {
        nombre: parsed.data.nombre,
        sedeId: parsed.data.sedeId,
        especialidadId: parsed.data.especialidadId ?? null,
        medicoId: parsed.data.medicoId ?? null,
      },
      include: consultorioInclude,
    });
    await writeAuditLog(prisma, { accion: 'CREAR_CONSULTORIO', entidad: 'Consultorio', entidadId: consultorio.id, detalle: { nombre: consultorio.nombre } });
    res.status(201).json(consultorio);
  } catch (err) {
    next(err);
  }
}

async function updateConsultorio(req, res, next) {
  try {
    const parsed = consultorioSchema.safeParse(req.body);
    if (!parsed.success) return invalido(res, parsed);
    const consultorio = await prisma.consultorio.update({
      where: { id: req.params.id },
      data: {
        nombre: parsed.data.nombre,
        sedeId: parsed.data.sedeId,
        especialidadId: parsed.data.especialidadId ?? null,
        medicoId: parsed.data.medicoId ?? null,
      },
      include: consultorioInclude,
    });
    await writeAuditLog(prisma, { accion: 'EDITAR_CONSULTORIO', entidad: 'Consultorio', entidadId: consultorio.id, detalle: { nombre: consultorio.nombre } });
    res.json(consultorio);
  } catch (err) {
    next(err);
  }
}

async function setEstadoConsultorio(req, res, next) {
  try {
    const parsed = estadoSchema.safeParse(req.body);
    if (!parsed.success) return invalido(res, parsed);
    const consultorio = await prisma.consultorio.update({
      where: { id: req.params.id },
      data: { activo: parsed.data.activo },
      include: consultorioInclude,
    });
    await writeAuditLog(prisma, {
      accion: parsed.data.activo ? 'ACTIVAR_CONSULTORIO' : 'DESACTIVAR_CONSULTORIO',
      entidad: 'Consultorio',
      entidadId: consultorio.id,
      detalle: null,
    });
    res.json(consultorio);
  } catch (err) {
    next(err);
  }
}

async function listMedicos(req, res, next) {
  try {
    const medicos = await prisma.user.findMany({
      where: { activo: true, rol: { slug: { in: ROLES_CLINICOS } } },
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        cargoProfesion: true,
        rol: { select: { nombre: true, slug: true } },
      },
      orderBy: [{ apellidos: 'asc' }, { nombres: 'asc' }],
    });
    res.json(medicos);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listEspecialidades,
  createEspecialidad,
  updateEspecialidad,
  setEstadoEspecialidad,
  listConsultorios,
  createConsultorio,
  updateConsultorio,
  setEstadoConsultorio,
  listMedicos,
};
