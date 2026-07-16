const prisma = require('../config/prisma');

// Roles cuyo usuario puede figurar como médico tratante de una cita.
const ROLES_CLINICOS = [
  'medico-general',
  'psiquiatra',
  'psicologo',
  'neuropsicologo',
  'odontologo',
  'nutricionista',
];

async function listEspecialidades(req, res, next) {
  try {
    const especialidades = await prisma.especialidad.findMany({
      where: { activa: true },
      orderBy: { nombre: 'asc' },
    });
    res.json(especialidades);
  } catch (err) {
    next(err);
  }
}

async function listConsultorios(req, res, next) {
  try {
    const consultorios = await prisma.consultorio.findMany({
      where: {
        activo: true,
        ...(req.query.sedeId ? { sedeId: req.query.sedeId } : {}),
      },
      include: {
        sede: { select: { id: true, nombre: true } },
        especialidad: { select: { id: true, nombre: true } },
        medico: { select: { id: true, nombres: true, apellidos: true } },
      },
      orderBy: [{ sedeId: 'asc' }, { nombre: 'asc' }],
    });
    res.json(consultorios);
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

module.exports = { listEspecialidades, listConsultorios, listMedicos };
