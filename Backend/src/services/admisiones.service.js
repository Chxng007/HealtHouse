const prisma = require('../config/prisma');

// Máquina de estados de la admisión (RF-ADM2-01).
const TRANSICIONES = {
  en_espera: ['en_atencion', 'cancelado'],
  en_atencion: ['atendido', 'cancelado'],
  atendido: [],
  cancelado: [],
};

// Estado de la cita ligada al mover la admisión (se sincroniza en la misma transacción).
const ESTADO_CITA_POR_ADMISION = {
  en_atencion: 'en_atencion',
  atendido: 'atendida',
  cancelado: 'cancelada',
};

const admisionInclude = {
  paciente: {
    select: {
      id: true, nombres: true, apellidos: true, tipoDocumento: true,
      numeroDocumento: true, telefono: true, fotoUrl: true,
    },
  },
  medico: { select: { id: true, nombres: true, apellidos: true, cargoProfesion: true } },
  sede: { select: { id: true, nombre: true } },
  eps: { select: { id: true, nombre: true } },
  cita: { select: { id: true, inicio: true, fin: true, estado: true, motivo: true } },
  atencion: { select: { id: true } },
};

function conflicto(mensaje) {
  return Object.assign(new Error(mensaje), { status: 409 });
}

function rangoDeHoy() {
  const desde = new Date();
  desde.setHours(0, 0, 0, 0);
  const hasta = new Date(desde);
  hasta.setDate(hasta.getDate() + 1);
  return { desde, hasta };
}

async function listAdmisiones({ sedeId, estado, pacienteId } = {}) {
  const { desde, hasta } = rangoDeHoy();
  return prisma.admision.findMany({
    where: {
      horaLlegada: { gte: desde, lt: hasta },
      ...(sedeId ? { sedeId } : {}),
      ...(estado ? { estado } : {}),
      ...(pacienteId ? { pacienteId } : {}),
    },
    include: admisionInclude,
    orderBy: { horaLlegada: 'asc' },
  });
}

async function listaEspera({ sedeId } = {}) {
  return listAdmisiones({ sedeId, estado: 'en_espera' });
}

async function createAdmision(data) {
  return prisma.$transaction(async (tx) => {
    const paciente = await tx.paciente.findUniqueOrThrow({ where: { id: data.pacienteId } });
    if (!paciente.activo) {
      throw conflicto('El paciente está inactivo; actívalo antes de admitirlo.');
    }

    if (data.citaId) {
      const cita = await tx.cita.findUniqueOrThrow({ where: { id: data.citaId }, include: { admision: true } });
      if (cita.pacienteId !== data.pacienteId) {
        throw conflicto('La cita seleccionada no pertenece al paciente.');
      }
      if (cita.admision) {
        throw conflicto('La cita ya tiene una admisión registrada.');
      }
      if (['cancelada', 'no_asistio', 'atendida'].includes(cita.estado)) {
        throw conflicto(`No se puede admitir una cita en estado "${cita.estado}".`);
      }
      if (cita.estado === 'agendada') {
        await tx.cita.update({ where: { id: cita.id }, data: { estado: 'confirmada' } });
      }
    }

    return tx.admision.create({
      data: {
        pacienteId: data.pacienteId,
        citaId: data.citaId ?? null,
        sedeId: data.sedeId,
        medicoId: data.medicoId,
        tipoAtencion: data.tipoAtencion,
        // Snapshot del aseguramiento al momento de la admisión (RF-ADM2-01):
        // si luego cambia la EPS del paciente, la admisión conserva la histórica.
        epsId: paciente.epsId,
        regimen: paciente.regimen,
        numeroAutorizacion: data.numeroAutorizacion ?? null,
        copago: data.copago ?? null,
        observaciones: data.observaciones ?? null,
      },
      include: admisionInclude,
    });
  });
}

async function setEstado(id, estado) {
  return prisma.$transaction(async (tx) => {
    const admision = await tx.admision.findUniqueOrThrow({ where: { id } });
    if (!TRANSICIONES[admision.estado].includes(estado)) {
      throw conflicto(`Transición inválida: de "${admision.estado}" no se puede pasar a "${estado}".`);
    }

    if (admision.citaId) {
      const estadoCita = ESTADO_CITA_POR_ADMISION[estado];
      const cita = await tx.cita.findUniqueOrThrow({ where: { id: admision.citaId } });
      const transicionesCita = {
        agendada: ['confirmada', 'en_atencion', 'cancelada', 'no_asistio'],
        confirmada: ['en_atencion', 'cancelada', 'no_asistio'],
        en_atencion: ['atendida', 'cancelada'],
      };
      if (estadoCita && transicionesCita[cita.estado]?.includes(estadoCita)) {
        await tx.cita.update({
          where: { id: cita.id },
          data: {
            estado: estadoCita,
            ...(estadoCita === 'cancelada' ? { motivoCancelacion: 'Admisión cancelada' } : {}),
          },
        });
      }
    }

    return tx.admision.update({ where: { id }, data: { estado }, include: admisionInclude });
  });
}

module.exports = { listAdmisiones, listaEspera, createAdmision, setEstado };
