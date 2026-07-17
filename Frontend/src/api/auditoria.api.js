import { apiGet } from './client';

export const listAuditLogs = ({ entidad, accion, desde, hasta, page = 1, pageSize = 20 } = {}) => {
  const params = new URLSearchParams();
  if (entidad) params.set('entidad', entidad);
  if (accion) params.set('accion', accion);
  if (desde) params.set('desde', desde);
  if (hasta) params.set('hasta', hasta);
  params.set('page', page);
  params.set('pageSize', pageSize);
  return apiGet(`/api/auditoria?${params}`);
};

export const getEntidadesAuditoria = () => apiGet('/api/auditoria/entidades');
export const getAccionesAuditoria = () => apiGet('/api/auditoria/acciones');
