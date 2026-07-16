const prisma = require('../config/prisma');

const ESTADOS_ACTIVOS_NOT_IN = ['cancelada', 'no_asistio'];

// Máquina de estados de la cita (RF-AGN-06).
const TRANSICIONES = {
  agendada: ['confirmada', 'en_atencion', 'cancelada', 'no_asistio'],
  confirmada: ['en_atencion', 'cancelada', 'no_asistio'],
  en_atencion: ['atendida', 'cancelada'],
  atendida: [],
  cancelada: [],
  no_asistio: [],
};

const citaInclude = {
  paciente: { select: { id: true, nombres: true, apellidos: true, numeroDocumento: true, telefono: true } },
  medico: { select: { id: true, nombres: true, apellidos: true, cargoProfesion: true } },
  consultorio: { select: { id: true, nombre: true } },
  sede: { select: { id: true, nombre: true } },
};

function conflicto(mensaje) {
  return Object.assign(new Error(mensaje), { status: 409 });
}

// Chequeo de solape en servicio (mensaje amigable); la constraint de exclusión
// en DB (citas_*_sin_solape) es el respaldo ante condiciones de carrera.
async function assertSinSolape(tx, { medicoId, consultorioId, inicio, fin, ignorarCitaId }) {
  const solapada = await tx.cita.findFirst({
    where: {
      OR: [{ medicoId }, { consultorioId }],
      estado: { notIn: ESTADOS_ACTIVOS_NOT_IN },
      inicio: { lt: fin },
      fin: { gt: inicio },
      ...(ignorarCitaId ? { id: { not: ignorarCitaId } } : {}),
    },
    include: { medico: { select: { nombres: true, apellidos: true } }, consultorio: { select: { nombre: true } } },
  });
  if (solapada) {
    const recurso = solapada.medicoId === medicoId
      ? `el médico ${solapada.medico.nombres} ${solapada.medico.apellidos}`
      : `el consultorio ${solapada.consultorio.nombre}`;
    throw conflicto(`Horario no disponible: ${recurso} ya tiene una cita en esa franja.`);
  }
}

async function listCitas({ desde, hasta, medicoId, sedeId, consultorioId, estado } = {}) {
  return prisma.cita.findMany({
    where: {
      ...(desde || hasta
        ? { inicio: { ...(desde ? { gte: desde } : {}), ...(hasta ? { lt: hasta } : {}) } }
        : {}),
      ...(medicoId ? { medicoId } : {}),
      ...(sedeId ? { sedeId } : {}),
      ...(consultorioId ? { consultorioId } : {}),
      ...(estado ? { estado } : {}),
    },
    include: citaInclude,
    orderBy: { inicio: 'asc' },
  });
}

async function getCitaById(id) {
  return prisma.cita.findUniqueOrThrow({ where: { id }, include: citaInclude });
}

async function createCita(data) {
  return prisma.$transaction(async (tx) => {
    await assertSinSolape(tx, data);
    return tx.cita.create({
      data: {
        pacienteId: data.pacienteId,
        medicoId: data.medicoId,
        consultorioId: data.consultorioId,
        sedeId: data.sedeId,
        inicio: data.inicio,
        fin: data.fin,
        motivo: data.motivo,
        notas: data.notas,
        // STUB SMS/email (RF-AGN-03): se crea el recordatorio en estado pendiente;
        // el envío real se conecta cuando haya credenciales del proveedor.
        recordatorios: {
          create: [{ canal: 'email', programadoPara: new Date(data.inicio.getTime() - 24 * 60 * 60 * 1000) }],
        },
      },
      include: citaInclude,
    });
  });
}

async function reprogramarCita(id, { inicio, fin, motivoReprogramacion }) {
  return prisma.$transaction(async (tx) => {
    const cita = await tx.cita.findUniqueOrThrow({ where: { id } });
    if (['atendida', 'cancelada', 'no_asistio'].includes(cita.estado)) {
      throw conflicto(`No se puede reprogramar una cita en estado "${cita.estado}".`);
    }
    await assertSinSolape(tx, {
      medicoId: cita.medicoId,
      consultorioId: cita.consultorioId,
      inicio,
      fin,
      ignorarCitaId: id,
    });
    return tx.cita.update({
      where: { id },
      data: { inicio, fin, motivoReprogramacion, estado: 'agendada' },
      include: citaInclude,
    });
  });
}

async function setEstadoCita(id, { estado, motivoCancelacion }) {
  return prisma.$transaction(async (tx) => {
    const cita = await tx.cita.findUniqueOrThrow({ where: { id } });
    if (!TRANSICIONES[cita.estado].includes(estado)) {
      throw conflicto(`Transición inválida: de "${cita.estado}" no se puede pasar a "${estado}".`);
    }
    return tx.cita.update({
      where: { id },
      data: { estado, ...(estado === 'cancelada' ? { motivoCancelacion } : {}) },
      include: citaInclude,
    });
  });
}

async function citasDeHoy({ sedeId } = {}) {
  const inicio = new Date();
  inicio.setHours(0, 0, 0, 0);
  const fin = new Date(inicio);
  fin.setDate(fin.getDate() + 1);
  return listCitas({ desde: inicio, hasta: fin, sedeId });
}

module.exports = {
  listCitas,
  getCitaById,
  createCita,
  reprogramarCita,
  setEstadoCita,
  citasDeHoy,
};
