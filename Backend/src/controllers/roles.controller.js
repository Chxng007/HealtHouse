const prisma = require('../config/prisma');

async function listRoles(req, res, next) {
  try {
    const roles = await prisma.role.findMany({ orderBy: { createdAt: 'asc' } });
    res.json(roles);
  } catch (err) {
    next(err);
  }
}

module.exports = { listRoles };
