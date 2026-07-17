import { apiGet, apiPatchJson, apiPostJson, apiPutJson } from './client';

export const getEps = ({ todas } = {}) => apiGet(`/api/eps${todas ? '?todas=true' : ''}`);
export const createEps = (payload) => apiPostJson('/api/eps', payload);
export const updateEps = (id, payload) => apiPutJson(`/api/eps/${id}`, payload);
export const setEstadoEps = (id, activo) => apiPatchJson(`/api/eps/${id}/estado`, { activo });
