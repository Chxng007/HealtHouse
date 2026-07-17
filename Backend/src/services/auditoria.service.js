const prisma = require('../config/prisma');

async function listAuditLogs({ entidad, accion, desde, hasta, page = 1, pageSize = 20 } = {}) {
  const filters = [];
  if (entidad) filters.push({ entidad });
  if (accion) filters.push({ accion });
  if (desde || hasta) {
    filters.push({
      createdAt: {
        ...(desde ? { gte: desde } : {}),
        ...(hasta ? { lt: hasta } : {}),
      },
    });
  }
  const where = filters.length ? { AND: filters } : undefined;
  const skip = (page - 1) * pageSize;

  const [data, total] = await prisma.$transaction([
    prisma.auditLog.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: pageSize }),
    prisma.auditLog.count({ where }),
  ]);
  return { data, total, page, pageSize };
}

async function listEntidadesDistintas() {
  const rows = await prisma.auditLog.findMany({ distinct: ['entidad'], select: { entidad: true }, orderBy: { entidad: 'asc' } });
  return rows.map((r) => r.entidad);
}

async function listAccionesDistintas() {
  const rows = await prisma.auditLog.findMany({ distinct: ['accion'], select: { accion: true }, orderBy: { accion: 'asc' } });
  return rows.map((r) => r.accion);
}

module.exports = { listAuditLogs, listEntidadesDistintas, listAccionesDistintas };
