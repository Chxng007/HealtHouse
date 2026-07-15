async function writeAuditLog(prismaClient, { actorId = null, accion, entidad, entidadId, detalle }) {
  await prismaClient.auditLog.create({
    data: { actorId, accion, entidad, entidadId, detalle },
  });
}

module.exports = { writeAuditLog };
