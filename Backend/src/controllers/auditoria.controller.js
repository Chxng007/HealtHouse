const auditoriaService = require('../services/auditoria.service');

function finDeDiaExclusivo(fechaStr) {
  const fecha = new Date(fechaStr);
  fecha.setDate(fecha.getDate() + 1);
  return fecha;
}

async function listAuditLogs(req, res, next) {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize, 10) || 20, 1), 200);
    res.json(await auditoriaService.listAuditLogs({
      entidad: req.query.entidad,
      accion: req.query.accion,
      desde: req.query.desde ? new Date(req.query.desde) : undefined,
      hasta: req.query.hasta ? finDeDiaExclusivo(req.query.hasta) : undefined,
      page,
      pageSize,
    }));
  } catch (err) {
    next(err);
  }
}

async function listEntidades(req, res, next) {
  try {
    res.json(await auditoriaService.listEntidadesDistintas());
  } catch (err) {
    next(err);
  }
}

async function listAcciones(req, res, next) {
  try {
    res.json(await auditoriaService.listAccionesDistintas());
  } catch (err) {
    next(err);
  }
}

module.exports = { listAuditLogs, listEntidades, listAcciones };
