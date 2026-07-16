const { Prisma } = require('@prisma/client');
const prisma = require('../config/prisma');

const pacienteInclude = {
  eps: true,
  sedeRegistro: true,
  contactos: true,
};

function toData(data, fotoUrl) {
  return {
    tipoDocumento: data.tipoDocumento,
    numeroDocumento: data.numeroDocumento,
    nombres: data.nombres,
    apellidos: data.apellidos,
    fechaNacimiento: data.fechaNacimiento,
    sexo: data.sexo,
    estadoCivil: data.estadoCivil ?? null,
    ocupacion: data.ocupacion ?? null,
    grupoSanguineo: data.grupoSanguineo ?? null,
    rh: data.rh ?? null,
    telefono: data.telefono,
    correo: data.correo ?? null,
    direccion: data.direccion,
    municipio: data.municipio,
    zona: data.zona,
    epsId: data.epsId,
    regimen: data.regimen,
    nroAfiliacion: data.nroAfiliacion ?? null,
    sedeRegistroId: data.sedeRegistroId ?? null,
    activo: data.activo,
    ...(fotoUrl ? { fotoUrl } : {}),
  };
}

async function listPacientes({ search, documento, epsId, page = 1, pageSize = 10 } = {}) {
  const filters = [];
  if (documento) filters.push({ numeroDocumento: { contains: documento } });
  if (search) {
    // Búsqueda insensible a acentos ("maria" encuentra "María") vía extensión unaccent.
    const words = search.trim().split(/\s+/);
    const conds = words.map(
      (word) =>
        Prisma.sql`(unaccent(nombres) ILIKE unaccent(${`%${word}%`}) OR unaccent(apellidos) ILIKE unaccent(${`%${word}%`}))`,
    );
    const rows = await prisma.$queryRaw(
      Prisma.sql`SELECT id FROM pacientes WHERE ${Prisma.join(conds, ' AND ')}`,
    );
    filters.push({ id: { in: rows.map((r) => r.id) } });
  }
  if (epsId) filters.push({ epsId });

  const where = filters.length ? { AND: filters } : undefined;
  const skip = (page - 1) * pageSize;

  const [data, total] = await prisma.$transaction([
    prisma.paciente.findMany({
      where,
      include: pacienteInclude,
      orderBy: [{ apellidos: 'asc' }, { nombres: 'asc' }],
      skip,
      take: pageSize,
    }),
    prisma.paciente.count({ where }),
  ]);

  return { data, total, page, pageSize };
}

async function getPacienteById(id) {
  return prisma.paciente.findUniqueOrThrow({
    where: { id },
    include: pacienteInclude,
  });
}

async function getStats() {
  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);

  const [total, nuevosMes] = await prisma.$transaction([
    prisma.paciente.count(),
    prisma.paciente.count({ where: { createdAt: { gte: inicioMes } } }),
  ]);

  // Citas de hoy y atenciones de la semana se completan cuando existan esos módulos (Fases 2 y 4).
  return { total, nuevosMes, citasHoy: 0, atencionesSemana: 0 };
}

async function createPaciente(data, fotoUrl) {
  return prisma.paciente.create({
    data: {
      ...toData(data, fotoUrl),
      contactos: { create: data.contactos },
    },
    include: pacienteInclude,
  });
}

async function updatePaciente(id, data, fotoUrl) {
  return prisma.$transaction(async (tx) => {
    await tx.contactoEmergencia.deleteMany({ where: { pacienteId: id } });
    return tx.paciente.update({
      where: { id },
      data: {
        ...toData(data, fotoUrl),
        contactos: { create: data.contactos },
      },
      include: pacienteInclude,
    });
  });
}

async function setEstado(id, activo) {
  return prisma.paciente.update({
    where: { id },
    data: { activo },
    include: pacienteInclude,
  });
}

async function getHistorial(id) {
  await prisma.paciente.findUniqueOrThrow({ where: { id }, select: { id: true } });
  // Se llena con atenciones/facturas reales en las Fases 2-6.
  return [];
}

module.exports = {
  listPacientes,
  getPacienteById,
  getStats,
  createPaciente,
  updatePaciente,
  setEstado,
  getHistorial,
};
