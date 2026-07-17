const dashboardService = require('../services/dashboard.service');

async function getKpis(req, res, next) {
  try {
    res.json(await dashboardService.getKpis());
  } catch (err) {
    next(err);
  }
}

module.exports = { getKpis };
