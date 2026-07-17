const prisma = require('../config/prisma');

function conflicto(mensaje) {
  return Object.assign(new Error(mensaje), { status: 409 });
}

const docInclude = {
  paciente: { select: { id: true, nombres: true, apellidos: true, tipoDocumento: true, numeroDocumento: true, eps: { select: { nombre: true } } } },
  medico: { select: { id: true, nombres: true, apellidos: true, cargoProfesion: true } },
  sede: { select: { id: true, nombre: true } },
  atencion: { select: { id: true, fecha: true } },
};

async function assertAtencionPertenece(tx, atencionId, pacienteId) {
  if (!atencionId) return;
  const atencion = await tx.atencion.findUniqueOrThrow({ where: { id: atencionId } });
  if (atencion.pacienteId !== pacienteId) {
    throw conflicto('La atención seleccionada no pertenece al paciente.');
  }
}

// --- Fórmulas ---

async function listFormulas({ pacienteId } = {}) {
  return prisma.formula.findMany({
    where: { ...(pacienteId ? { pacienteId } : {}) },
    include: { ...docInclude, items: true },
    orderBy: { fecha: 'desc' },
  });
}

async function getFormula(id) {
  return prisma.formula.findUniqueOrThrow({ where: { id }, include: { ...docInclude, items: true } });
}

async function createFormula(data) {
  return prisma.$transaction(async (tx) => {
    await assertAtencionPertenece(tx, data.atencionId, data.pacienteId);
    return tx.formula.create({
      data: {
        pacienteId: data.pacienteId,
        atencionId: data.atencionId ?? null,
        medicoId: data.medicoId,
        sedeId: data.sedeId,
        items: { create: data.items },
      },
      include: { ...docInclude, items: true },
    });
  });
}

async function anularFormula(id, motivo) {
  const formula = await prisma.formula.findUniqueOrThrow({ where: { id } });
  if (formula.estado === 'anulado') throw conflicto('La fórmula ya está anulada.');
  return prisma.formula.update({
    where: { id },
    data: { estado: 'anulado', anuladaMotivo: motivo, anuladaAt: new Date() },
    include: { ...docInclude, items: true },
  });
}

// --- Órdenes ---

async function listOrdenes({ pacienteId } = {}) {
  return prisma.orden.findMany({
    where: { ...(pacienteId ? { pacienteId } : {}) },
    include: { ...docInclude, items: { include: { cups: true } } },
    orderBy: { fecha: 'desc' },
  });
}

async function getOrden(id) {
  return prisma.orden.findUniqueOrThrow({ where: { id }, include: { ...docInclude, items: { include: { cups: true } } } });
}

async function createOrden(data) {
  return prisma.$transaction(async (tx) => {
    await assertAtencionPertenece(tx, data.atencionId, data.pacienteId);
    return tx.orden.create({
      data: {
        pacienteId: data.pacienteId,
        atencionId: data.atencionId ?? null,
        medicoId: data.medicoId,
        sedeId: data.sedeId,
        items: { create: data.items },
      },
      include: { ...docInclude, items: { include: { cups: true } } },
    });
  });
}

async function anularOrden(id, motivo) {
  const orden = await prisma.orden.findUniqueOrThrow({ where: { id } });
  if (orden.estado === 'anulado') throw conflicto('La orden ya está anulada.');
  return prisma.orden.update({
    where: { id },
    data: { estado: 'anulado', anuladaMotivo: motivo, anuladaAt: new Date() },
    include: { ...docInclude, items: { include: { cups: true } } },
  });
}

// --- Remisiones ---

async function listRemisiones({ pacienteId } = {}) {
  return prisma.remision.findMany({ where: { ...(pacienteId ? { pacienteId } : {}) }, include: docInclude, orderBy: { fecha: 'desc' } });
}

async function getRemision(id) {
  return prisma.remision.findUniqueOrThrow({ where: { id }, include: docInclude });
}

async function createRemision(data) {
  return prisma.$transaction(async (tx) => {
    await assertAtencionPertenece(tx, data.atencionId, data.pacienteId);
    return tx.remision.create({
      data: {
        pacienteId: data.pacienteId,
        atencionId: data.atencionId ?? null,
        medicoId: data.medicoId,
        sedeId: data.sedeId,
        especialidadDestino: data.especialidadDestino,
        ipsDestino: data.ipsDestino,
        justificacion: data.justificacion,
      },
      include: docInclude,
    });
  });
}

async function anularRemision(id, motivo) {
  const remision = await prisma.remision.findUniqueOrThrow({ where: { id } });
  if (remision.estado === 'anulado') throw conflicto('La remisión ya está anulada.');
  return prisma.remision.update({
    where: { id },
    data: { estado: 'anulado', anuladaMotivo: motivo, anuladaAt: new Date() },
    include: docInclude,
  });
}

// --- Incapacidades ---

async function listIncapacidades({ pacienteId } = {}) {
  return prisma.incapacidad.findMany({
    where: { ...(pacienteId ? { pacienteId } : {}) },
    include: { ...docInclude, cie10: true },
    orderBy: { fecha: 'desc' },
  });
}

async function getIncapacidad(id) {
  return prisma.incapacidad.findUniqueOrThrow({ where: { id }, include: { ...docInclude, cie10: true } });
}

async function createIncapacidad(data) {
  return prisma.$transaction(async (tx) => {
    await assertAtencionPertenece(tx, data.atencionId, data.pacienteId);
    return tx.incapacidad.create({
      data: {
        pacienteId: data.pacienteId,
        atencionId: data.atencionId ?? null,
        medicoId: data.medicoId,
        sedeId: data.sedeId,
        cie10Id: data.cie10Id,
        numeroDias: data.numeroDias,
        fechaInicio: data.fechaInicio,
        fechaFin: data.fechaFin,
      },
      include: { ...docInclude, cie10: true },
    });
  });
}

async function anularIncapacidad(id, motivo) {
  const incapacidad = await prisma.incapacidad.findUniqueOrThrow({ where: { id } });
  if (incapacidad.estado === 'anulado') throw conflicto('La incapacidad ya está anulada.');
  return prisma.incapacidad.update({
    where: { id },
    data: { estado: 'anulado', anuladaMotivo: motivo, anuladaAt: new Date() },
    include: { ...docInclude, cie10: true },
  });
}

// --- Consentimientos ---

async function listConsentimientos({ pacienteId } = {}) {
  return prisma.consentimiento.findMany({ where: { ...(pacienteId ? { pacienteId } : {}) }, include: docInclude, orderBy: { fecha: 'desc' } });
}

async function getConsentimiento(id) {
  return prisma.consentimiento.findUniqueOrThrow({ where: { id }, include: docInclude });
}

async function createConsentimiento(data) {
  return prisma.$transaction(async (tx) => {
    await assertAtencionPertenece(tx, data.atencionId, data.pacienteId);
    return tx.consentimiento.create({
      data: {
        pacienteId: data.pacienteId,
        atencionId: data.atencionId ?? null,
        medicoId: data.medicoId,
        sedeId: data.sedeId,
        procedimiento: data.procedimiento,
        firmante: data.firmante,
      },
      include: docInclude,
    });
  });
}

async function firmarConsentimiento(id, firmaUrl) {
  const consentimiento = await prisma.consentimiento.findUniqueOrThrow({ where: { id } });
  if (consentimiento.estado !== 'pendiente') {
    throw conflicto(`No se puede firmar un consentimiento en estado "${consentimiento.estado}".`);
  }
  return prisma.consentimiento.update({
    where: { id },
    data: { estado: 'firmado', firmaUrl },
    include: docInclude,
  });
}

async function anularConsentimiento(id, motivo) {
  const consentimiento = await prisma.consentimiento.findUniqueOrThrow({ where: { id } });
  if (consentimiento.estado === 'anulado') throw conflicto('El consentimiento ya está anulado.');
  return prisma.consentimiento.update({
    where: { id },
    data: { estado: 'anulado', anuladaMotivo: motivo, anuladaAt: new Date() },
    include: docInclude,
  });
}

module.exports = {
  listFormulas, getFormula, createFormula, anularFormula,
  listOrdenes, getOrden, createOrden, anularOrden,
  listRemisiones, getRemision, createRemision, anularRemision,
  listIncapacidades, getIncapacidad, createIncapacidad, anularIncapacidad,
  listConsentimientos, getConsentimiento, createConsentimiento, firmarConsentimiento, anularConsentimiento,
};
