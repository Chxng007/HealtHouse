const prisma = require('../config/prisma');

async function searchCie10(req, res, next) {
  try {
    const search = (req.query.search ?? '').trim();
    const codigos = await prisma.cie10.findMany({
      where: {
        activo: true,
        ...(search
          ? {
              OR: [
                { codigo: { contains: search, mode: 'insensitive' } },
                { descripcion: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { codigo: 'asc' },
      take: 20,
    });
    res.json(codigos);
  } catch (err) {
    next(err);
  }
}

module.exports = { searchCie10 };
