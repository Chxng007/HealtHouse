const prisma = require('../config/prisma');
const { writeAuditLog } = require('../utils/audit');
const { servicioSchema, convenioSchema, tarifaSchema, estadoSchema } = require('../validators/parametrizacion.schema');

function invalido(res, parsed) {
  return res.status(400).json({ error: 'Datos inválidos', detalles: parsed.error.flatten().fieldErrors });
}

async function listConvenios(req, res, next) {
  try {
    const convenios = await prisma.convenio.findMany({
      where: req.query.todas === 'true' ? undefined : { activo: true },
      include: { eps: { select: { id: true, nombre: true } } },
      orderBy: [{ epsId: 'asc' }, { tipoContrato: 'asc' }],
    });
    res.json(convenios);
  } catch (err) {
    next(err);
  }
}

async function createConvenio(req, res, next) {
  try {
    const parsed = convenioSchema.safeParse(req.body);
    if (!parsed.success) return invalido(res, parsed);
    const convenio = await prisma.convenio.create({ data: parsed.data, include: { eps: true } });
    await writeAuditLog(prisma, { accion: 'CREAR_CONVENIO', entidad: 'Convenio', entidadId: convenio.id, detalle: { eps: convenio.eps.nombre, tipoContrato: convenio.tipoContrato } });
    res.status(201).json(convenio);
  } catch (err) {
    next(err);
  }
}

async function setEstadoConvenio(req, res, next) {
  try {
    const parsed = estadoSchema.safeParse(req.body);
    if (!parsed.success) return invalido(res, parsed);
    const convenio = await prisma.convenio.update({ where: { id: req.params.id }, data: { activo: parsed.data.activo }, include: { eps: true } });
    await writeAuditLog(prisma, {
      accion: parsed.data.activo ? 'ACTIVAR_CONVENIO' : 'DESACTIVAR_CONVENIO',
      entidad: 'Convenio',
      entidadId: convenio.id,
      detalle: null,
    });
    res.json(convenio);
  } catch (err) {
    next(err);
  }
}

async function listServicios(req, res, next) {
  try {
    const servicios = await prisma.servicio.findMany({
      where: req.query.todas === 'true' ? undefined : { activo: true },
      orderBy: { nombre: 'asc' },
    });
    res.json(servicios);
  } catch (err) {
    next(err);
  }
}

async function createServicio(req, res, next) {
  try {
    const parsed = servicioSchema.safeParse(req.body);
    if (!parsed.success) return invalido(res, parsed);
    const servicio = await prisma.servicio.create({ data: parsed.data });
    await writeAuditLog(prisma, { accion: 'CREAR_SERVICIO', entidad: 'Servicio', entidadId: servicio.id, detalle: { nombre: servicio.nombre } });
    res.status(201).json(servicio);
  } catch (err) {
    next(err);
  }
}

async function updateServicio(req, res, next) {
  try {
    const parsed = servicioSchema.safeParse(req.body);
    if (!parsed.success) return invalido(res, parsed);
    const servicio = await prisma.servicio.update({ where: { id: req.params.id }, data: parsed.data });
    await writeAuditLog(prisma, { accion: 'EDITAR_SERVICIO', entidad: 'Servicio', entidadId: servicio.id, detalle: { nombre: servicio.nombre } });
    res.json(servicio);
  } catch (err) {
    next(err);
  }
}

async function setEstadoServicio(req, res, next) {
  try {
    const parsed = estadoSchema.safeParse(req.body);
    if (!parsed.success) return invalido(res, parsed);
    const servicio = await prisma.servicio.update({ where: { id: req.params.id }, data: { activo: parsed.data.activo } });
    await writeAuditLog(prisma, {
      accion: parsed.data.activo ? 'ACTIVAR_SERVICIO' : 'DESACTIVAR_SERVICIO',
      entidad: 'Servicio',
      entidadId: servicio.id,
      detalle: null,
    });
    res.json(servicio);
  } catch (err) {
    next(err);
  }
}

async function listTarifasDeConvenio(req, res, next) {
  try {
    const tarifas = await prisma.tarifa.findMany({
      where: { convenioId: req.params.id },
      include: { servicio: true },
      orderBy: { servicio: { nombre: 'asc' } },
    });
    res.json(tarifas);
  } catch (err) {
    next(err);
  }
}

async function upsertTarifa(req, res, next) {
  try {
    const parsed = tarifaSchema.safeParse(req.body);
    if (!parsed.success) return invalido(res, parsed);
    const { convenioId, servicioId, valor, copago } = parsed.data;
    const tarifa = await prisma.tarifa.upsert({
      where: { convenioId_servicioId: { convenioId, servicioId } },
      update: { valor, copago },
      create: { convenioId, servicioId, valor, copago },
      include: { servicio: true, convenio: { include: { eps: true } } },
    });
    await writeAuditLog(prisma, {
      accion: 'ACTUALIZAR_TARIFA',
      entidad: 'Tarifa',
      entidadId: tarifa.id,
      detalle: { servicio: tarifa.servicio.nombre, convenio: `${tarifa.convenio.eps.nombre} · ${tarifa.convenio.tipoContrato}`, valor },
    });
    res.status(201).json(tarifa);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listConvenios, createConvenio, setEstadoConvenio,
  listServicios, createServicio, updateServicio, setEstadoServicio,
  listTarifasDeConvenio, upsertTarifa,
};
