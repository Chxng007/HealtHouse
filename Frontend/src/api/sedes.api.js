import { apiGet, apiPatchJson, apiPostJson, apiPutJson } from './client';

export const getSedes = ({ todas } = {}) => apiGet(`/api/sedes${todas ? '?todas=true' : ''}`);
export const createSede = (payload) => apiPostJson('/api/sedes', payload);
export const updateSede = (id, payload) => apiPutJson(`/api/sedes/${id}`, payload);
export const setEstadoSede = (id, activo) => apiPatchJson(`/api/sedes/${id}/estado`, { activo });
