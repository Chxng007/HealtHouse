const prisma = require('../config/prisma');

async function listEps(req, res, next) {
  try {
    const eps = await prisma.eps.findMany({
      where: { activa: true },
      orderBy: { nombre: 'asc' },
    });
    res.json(eps);
  } catch (err) {
    next(err);
  }
}

module.exports = { listEps };
