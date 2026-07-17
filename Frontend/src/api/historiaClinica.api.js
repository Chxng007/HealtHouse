import { apiGet, apiPatchJson, apiPostJson, apiPutJson } from './client';

export const listAtenciones = (pacienteId) => apiGet(`/api/atenciones?pacienteId=${pacienteId}`);

export const getAtencion = (id) => apiGet(`/api/atenciones/${id}`);

export const getTrazabilidadAtencion = (id) => apiGet(`/api/atenciones/${id}/trazabilidad`);

export const createAtencion = (payload) => apiPostJson('/api/atenciones', payload);

export const updateAtencion = (id, payload) => apiPutJson(`/api/atenciones/${id}`, payload);

export const cerrarAtencion = (id) => apiPostJson(`/api/atenciones/${id}/cerrar`);

export const anularAtencion = (id, motivo) => apiPatchJson(`/api/atenciones/${id}/anular`, { motivo });
