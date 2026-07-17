const { AsyncLocalStorage } = require('async_hooks');

const als = new AsyncLocalStorage();

function withRequestContext(req, res, next) {
  als.run({ ip: req.ip }, next);
}

function getRequestIp() {
  return als.getStore()?.ip ?? null;
}

module.exports = { withRequestContext, getRequestIp };
