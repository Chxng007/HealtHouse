const reportesService = require('../services/reportes.service');

async function getIndicadores(req, res, next) {
  try {
    res.json(await reportesService.getIndicadores({ desde: req.query.desde, hasta: req.query.hasta }));
  } catch (err) {
    next(err);
  }
}

async function exportarExcel(req, res, next) {
  try {
    const workbook = await reportesService.exportarExcel({ desde: req.query.desde, hasta: req.query.hasta });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte-indicadores.xlsx"');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
}

module.exports = { getIndicadores, exportarExcel };
