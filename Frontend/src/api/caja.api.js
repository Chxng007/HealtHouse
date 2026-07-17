import { apiGet, apiPostJson } from './client';

export const getResumenCaja = (sedeId) => apiGet(`/api/caja/resumen${sedeId ? `?sedeId=${sedeId}` : ''}`);
export const crearCierreCaja = (payload) => apiPostJson('/api/caja/cierres', payload);
