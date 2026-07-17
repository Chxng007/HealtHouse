const prisma = require('../config/prisma');

const MODULOS = ['pacientes', 'historia_clinica', 'agenda', 'formulas_ordenes', 'reportes', 'administracion'];

async function listRoles() {
  return prisma.role.findMany({
    include: { _count: { select: { users: true } } },
    orderBy: { createdAt: 'asc' },
  });
}

async function getPermisosDeRol(rolId) {
  await prisma.role.findUniqueOrThrow({ where: { id: rolId } });
  const existentes = await prisma.rolePermission.findMany({ where: { rolId } });
  const porModulo = new Map(existentes.map((p) => [p.modulo, p]));
  return MODULOS.map((modulo) => {
    const p = porModulo.get(modulo);
    return {
      modulo,
      ver: p?.ver ?? false,
      crear: p?.crear ?? false,
      editar: p?.editar ?? false,
      eliminar: p?.eliminar ?? false,
      imprimir: p?.imprimir ?? false,
      exportar: p?.exportar ?? false,
    };
  });
}

async function setPermisosDeRol(rolId, permisos) {
  await prisma.role.findUniqueOrThrow({ where: { id: rolId } });
  await prisma.$transaction(
    permisos.map((p) =>
      prisma.rolePermission.upsert({
        where: { rolId_modulo: { rolId, modulo: p.modulo } },
        update: { ver: p.ver, crear: p.crear, editar: p.editar, eliminar: p.eliminar, imprimir: p.imprimir, exportar: p.exportar },
        create: { rolId, ...p },
      }),
    ),
  );
  return getPermisosDeRol(rolId);
}

module.exports = { MODULOS, listRoles, getPermisosDeRol, setPermisosDeRol };
