import { apiGet, apiPatchJson, apiPostJson, apiPutJson } from './client';

export const searchCups = (search, { todas } = {}) => {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (todas) params.set('todas', 'true');
  return apiGet(`/api/cups?${params}`);
};
export const createCups = (payload) => apiPostJson('/api/cups', payload);
export const updateCups = (id, payload) => apiPutJson(`/api/cups/${id}`, payload);
export const setEstadoCups = (id, activo) => apiPatchJson(`/api/cups/${id}/estado`, { activo });
