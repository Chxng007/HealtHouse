const prisma = require('../config/prisma');

const atencionInclude = {
  paciente: {
    select: {
      id: true, nombres: true, apellidos: true, tipoDocumento: true, numeroDocumento: true, fechaNacimiento: true,
      fotoUrl: true, eps: { select: { nombre: true } },
    },
  },
  medico: { select: { id: true, nombres: true, apellidos: true, cargoProfesion: true } },
  sede: { select: { id: true, nombre: true } },
  admision: { select: { id: true, tipoAtencion: true, citaId: true } },
  signosVitales: true,
  diagnosticos: { include: { cie10: true }, orderBy: { tipo: 'asc' } },
};

// Estado de la cita ligada al cerrar la atención (misma convención que admisiones.service).
const ESTADO_CITA_AL_CERRAR = 'atendida';

function conflicto(mensaje) {
  return Object.assign(new Error(mensaje), { status: 409 });
}

function calcularImc(peso, talla) {
  if (!peso || !talla) return null;
  const tallaMetros = Number(talla) / 100;
  return Math.round((Number(peso) / (tallaMetros * tallaMetros)) * 10) / 10;
}

function assertEditable(atencion) {
  if (atencion.estado !== 'en_curso') {
    throw conflicto(`No se puede editar una atención en estado "${atencion.estado}".`);
  }
}

async function listAtenciones({ pacienteId, medicoId } = {}) {
  return prisma.atencion.findMany({
    where: {
      ...(pacienteId ? { pacienteId } : {}),
      ...(medicoId ? { medicoId } : {}),
    },
    include: atencionInclude,
    orderBy: { fecha: 'desc' },
  });
}

async function getAtencionById(id) {
  return prisma.atencion.findUniqueOrThrow({ where: { id }, include: atencionInclude });
}

async function getTrazabilidad(id) {
  await prisma.atencion.findUniqueOrThrow({ where: { id }, select: { id: true } });
  return prisma.auditLog.findMany({
    where: { entidad: 'Atencion', entidadId: id },
    orderBy: { createdAt: 'desc' },
  });
}

async function createAtencion(data) {
  return prisma.$transaction(async (tx) => {
    const paciente = await tx.paciente.findUniqueOrThrow({ where: { id: data.pacienteId } });
    if (!paciente.activo) {
      throw conflicto('El paciente está inactivo; actívalo antes de iniciar una atención.');
    }

    if (data.admisionId) {
      const admision = await tx.admision.findUniqueOrThrow({
        where: { id: data.admisionId },
        include: { atencion: { select: { id: true } }, cita: true },
      });
      if (admision.pacienteId !== data.pacienteId) {
        throw conflicto('La admisión seleccionada no pertenece al paciente.');
      }
      if (admision.atencion) {
        throw conflicto('La admisión ya tiene una atención registrada.');
      }
      if (admision.estado === 'atendido') {
        throw conflicto('La admisión ya fue atendida.');
      }
      if (admision.estado === 'cancelado') {
        throw conflicto('La admisión está cancelada.');
      }
      if (admision.estado === 'en_espera') {
        await tx.admision.update({ where: { id: admision.id }, data: { estado: 'en_atencion' } });
        if (admision.cita && ['agendada', 'confirmada'].includes(admision.cita.estado)) {
          await tx.cita.update({ where: { id: admision.cita.id }, data: { estado: 'en_atencion' } });
        }
      }
    }

    const { peso, talla } = data.signosVitales ?? {};

    return tx.atencion.create({
      data: {
        pacienteId: data.pacienteId,
        admisionId: data.admisionId ?? null,
        medicoId: data.medicoId,
        sedeId: data.sedeId,
        motivoConsulta: data.motivoConsulta,
        enfermedadActual: data.enfermedadActual ?? null,
        antecedentesPersonales: data.antecedentesPersonales ?? null,
        antecedentesFamiliares: data.antecedentesFamiliares ?? null,
        antecedentesFarmacologicos: data.antecedentesFarmacologicos ?? null,
        examenFisico: data.examenFisico ?? null,
        planManejo: data.planManejo ?? null,
        ...(data.signosVitales
          ? { signosVitales: { create: { ...data.signosVitales, imc: calcularImc(peso, talla) } } }
          : {}),
        diagnosticos: { create: data.diagnosticos },
      },
      include: atencionInclude,
    });
  });
}

async function updateAtencion(id, data) {
  return prisma.$transaction(async (tx) => {
    const atencion = await tx.atencion.findUniqueOrThrow({ where: { id } });
    assertEditable(atencion);

    const { peso, talla } = data.signosVitales ?? {};

    await tx.atencionDiagnostico.deleteMany({ where: { atencionId: id } });
    if (data.signosVitales) {
      await tx.signosVitales.upsert({
        where: { atencionId: id },
        create: { atencionId: id, ...data.signosVitales, imc: calcularImc(peso, talla) },
        update: { ...data.signosVitales, imc: calcularImc(peso, talla) },
      });
    }

    return tx.atencion.update({
      where: { id },
      data: {
        motivoConsulta: data.motivoConsulta,
        enfermedadActual: data.enfermedadActual ?? null,
        antecedentesPersonales: data.antecedentesPersonales ?? null,
        antecedentesFamiliares: data.antecedentesFamiliares ?? null,
        antecedentesFarmacologicos: data.antecedentesFarmacologicos ?? null,
        examenFisico: data.examenFisico ?? null,
        planManejo: data.planManejo ?? null,
        diagnosticos: { create: data.diagnosticos },
      },
      include: atencionInclude,
    });
  });
}

async function cerrarAtencion(id) {
  return prisma.$transaction(async (tx) => {
    const atencion = await tx.atencion.findUniqueOrThrow({ where: { id }, include: { admision: { include: { cita: true } } } });
    assertEditable(atencion);

    if (atencion.admisionId) {
      await tx.admision.update({ where: { id: atencion.admisionId }, data: { estado: 'atendido' } });
      const cita = atencion.admision?.cita;
      if (cita && cita.estado === 'en_atencion') {
        await tx.cita.update({ where: { id: cita.id }, data: { estado: ESTADO_CITA_AL_CERRAR } });
      }
    }

    return tx.atencion.update({
      where: { id },
      data: { estado: 'cerrada', cerradaAt: new Date() },
      include: atencionInclude,
    });
  });
}

async function anularAtencion(id, motivo) {
  return prisma.$transaction(async (tx) => {
    const atencion = await tx.atencion.findUniqueOrThrow({ where: { id } });
    if (atencion.estado === 'anulada') {
      throw conflicto('La atención ya está anulada.');
    }
    return tx.atencion.update({
      where: { id },
      data: { estado: 'anulada', anuladaMotivo: motivo, anuladaAt: new Date() },
      include: atencionInclude,
    });
  });
}

module.exports = {
  listAtenciones,
  getAtencionById,
  getTrazabilidad,
  createAtencion,
  updateAtencion,
  cerrarAtencion,
  anularAtencion,
};
