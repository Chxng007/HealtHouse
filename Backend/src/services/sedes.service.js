const prisma = require('../config/prisma');

async function listSedes({ todas } = {}) {
  return prisma.sede.findMany({
    where: todas ? undefined : { activa: true },
    include: { _count: { select: { consultorios: true, pacientesRegistrados: true } } },
    orderBy: { createdAt: 'asc' },
  });
}

async function createSede(data) {
  return prisma.$transaction(async (tx) => {
    if (data.esPrincipal) {
      await tx.sede.updateMany({ where: { esPrincipal: true }, data: { esPrincipal: false } });
    }
    return tx.sede.create({ data });
  });
}

async function updateSede(id, data) {
  return prisma.$transaction(async (tx) => {
    if (data.esPrincipal) {
      await tx.sede.updateMany({ where: { esPrincipal: true, id: { not: id } }, data: { esPrincipal: false } });
    }
    return tx.sede.update({ where: { id }, data });
  });
}

async function setEstado(id, activa) {
  return prisma.sede.update({ where: { id }, data: { activa } });
}

module.exports = { listSedes, createSede, updateSede, setEstado };
