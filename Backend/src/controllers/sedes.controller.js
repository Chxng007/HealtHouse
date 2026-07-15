const prisma = require('../config/prisma');

async function listSedes(req, res, next) {
  try {
    const sedes = await prisma.sede.findMany({
      where: { activa: true },
      orderBy: { createdAt: 'asc' },
    });
    res.json(sedes);
  } catch (err) {
    next(err);
  }
}

module.exports = { listSedes };
