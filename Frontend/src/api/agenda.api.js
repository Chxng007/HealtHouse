import { apiGet, apiPatchJson, apiPostJson, apiPutJson } from './client';

export const listCitas = ({ desde, hasta, medicoId, sedeId, consultorioId, estado } = {}) => {
  const params = new URLSearchParams();
  if (desde) params.set('desde', desde.toISOString());
  if (hasta) params.set('hasta', hasta.toISOString());
  if (medicoId) params.set('medicoId', medicoId);
  if (sedeId) params.set('sedeId', sedeId);
  if (consultorioId) params.set('consultorioId', consultorioId);
  if (estado) params.set('estado', estado);
  return apiGet(`/api/citas?${params}`);
};

export const getCitasHoy = () => apiGet('/api/citas/hoy');

export const createCita = (payload) => apiPostJson('/api/citas', payload);

export const reprogramarCita = (id, payload) => apiPutJson(`/api/citas/${id}/reprogramar`, payload);

export const setEstadoCita = (id, estado, motivoCancelacion) =>
  apiPatchJson(`/api/citas/${id}/estado`, { estado, motivoCancelacion });
