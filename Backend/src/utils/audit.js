const { getRequestIp } = require('./requestContext');

async function writeAuditLog(prismaClient, { actorId = null, accion, entidad, entidadId, detalle }) {
  await prismaClient.auditLog.create({
    data: { actorId, accion, entidad, entidadId, detalle, ip: getRequestIp() },
  });
}

module.exports = { writeAuditLog };
