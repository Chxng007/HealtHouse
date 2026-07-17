const { z } = require('zod');
const prisma = require('../config/prisma');

const putSchema = z.object({ valor: z.record(z.string(), z.unknown()) });

async function listConfiguracion(req, res, next) {
  try {
    res.json(await prisma.configuracion.findMany());
  } catch (err) {
    next(err);
  }
}

async function getConfiguracion(req, res, next) {
  try {
    const config = await prisma.configuracion.findUnique({ where: { clave: req.params.clave } });
    if (!config) return res.status(404).json({ error: 'Configuración no encontrada.' });
    res.json(config);
  } catch (err) {
    next(err);
  }
}

async function setConfiguracion(req, res, next) {
  try {
    const parsed = putSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Datos inválidos', detalles: parsed.error.flatten().fieldErrors });
    const config = await prisma.configuracion.upsert({
      where: { clave: req.params.clave },
      update: { valor: parsed.data.valor },
      create: { clave: req.params.clave, valor: parsed.data.valor },
    });
    res.json(config);
  } catch (err) {
    next(err);
  }
}

module.exports = { listConfiguracion, getConfiguracion, setConfiguracion };
