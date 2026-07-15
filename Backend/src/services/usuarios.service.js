const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');

const SALT_ROUNDS = 10;

const userInclude = {
  rol: true,
  sedes: { include: { sede: true } },
  permisos: true,
};

function serializeUser(user) {
  if (!user) return user;
  const { passwordHash, ...rest } = user;
  return {
    ...rest,
    sedes: user.sedes?.map((us) => us.sede) ?? [],
  };
}

async function listUsers({ search } = {}) {
  const where = search
    ? {
        OR: [
          { nombres: { contains: search, mode: 'insensitive' } },
          { apellidos: { contains: search, mode: 'insensitive' } },
          { correo: { contains: search, mode: 'insensitive' } },
          { numeroDocumento: { contains: search } },
        ],
      }
    : undefined;

  const users = await prisma.user.findMany({
    where,
    include: userInclude,
    orderBy: { createdAt: 'desc' },
  });
  return users.map(serializeUser);
}

async function getUserById(id) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id },
    include: userInclude,
  });
  return serializeUser(user);
}

async function createUser(data, fotoUrl) {
  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      nombres: data.nombres,
      apellidos: data.apellidos,
      tipoDocumento: data.tipoDocumento,
      numeroDocumento: data.numeroDocumento,
      correo: data.correo,
      telefono: data.telefono,
      cargoProfesion: data.cargoProfesion,
      rolId: data.rolId,
      activo: data.activo,
      mustChangePassword: data.mustChangePassword,
      fotoUrl,
      passwordHash,
      sedes: { create: data.sedeIds.map((sedeId) => ({ sedeId })) },
      permisos: { create: data.permisos },
    },
    include: userInclude,
  });

  return serializeUser(user);
}

async function updateUser(id, data, fotoUrl) {
  const user = await prisma.$transaction(async (tx) => {
    await tx.userPermission.deleteMany({ where: { userId: id } });
    await tx.userSede.deleteMany({ where: { userId: id } });

    const passwordHash = data.password ? await bcrypt.hash(data.password, SALT_ROUNDS) : undefined;

    return tx.user.update({
      where: { id },
      data: {
        nombres: data.nombres,
        apellidos: data.apellidos,
        tipoDocumento: data.tipoDocumento,
        numeroDocumento: data.numeroDocumento,
        correo: data.correo,
        telefono: data.telefono,
        cargoProfesion: data.cargoProfesion,
        rolId: data.rolId,
        activo: data.activo,
        mustChangePassword: data.mustChangePassword,
        ...(fotoUrl ? { fotoUrl } : {}),
        ...(passwordHash ? { passwordHash } : {}),
        sedes: { create: data.sedeIds.map((sedeId) => ({ sedeId })) },
        permisos: { create: data.permisos },
      },
      include: userInclude,
    });
  });

  return serializeUser(user);
}

async function setEstado(id, activo) {
  const user = await prisma.user.update({
    where: { id },
    data: { activo },
    include: userInclude,
  });
  return serializeUser(user);
}

async function setFoto(id, fotoUrl) {
  const user = await prisma.user.update({
    where: { id },
    data: { fotoUrl },
    include: userInclude,
  });
  return serializeUser(user);
}

module.exports = {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  setEstado,
  setFoto,
};
