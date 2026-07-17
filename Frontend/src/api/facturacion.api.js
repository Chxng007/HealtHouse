import { apiGet, apiPatchJson, apiPostJson } from './client';

export const listFacturas = ({ estado, search, page = 1, pageSize = 10 } = {}) => {
  const params = new URLSearchParams();
  if (estado) params.set('estado', estado);
  if (search) params.set('search', search);
  params.set('page', page);
  params.set('pageSize', pageSize);
  return apiGet(`/api/facturas?${params}`);
};

export const getStatsFacturas = () => apiGet('/api/facturas/stats');
export const getFactura = (id) => apiGet(`/api/facturas/${id}`);
export const createFactura = (payload) => apiPostJson('/api/facturas', payload);
export const emitirFactura = (id) => apiPostJson(`/api/facturas/${id}/emitir`);
export const setEstadoFactura = (id, estado, motivo) => apiPatchJson(`/api/facturas/${id}/estado`, { estado, motivo });
export const crearNotaFactura = (id, payload) => apiPostJson(`/api/facturas/${id}/notas`, payload);
export const registrarPago = (id, payload) => apiPostJson(`/api/facturas/${id}/pagos`, payload);
