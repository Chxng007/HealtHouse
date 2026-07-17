import { apiGet, apiPatchJson, apiPostJson, apiPutJson } from './client';

export const getConvenios = ({ todas } = {}) => apiGet(`/api/convenios${todas ? '?todas=true' : ''}`);
export const createConvenio = (payload) => apiPostJson('/api/convenios', payload);
export const setEstadoConvenio = (id, activo) => apiPatchJson(`/api/convenios/${id}/estado`, { activo });
export const getTarifasConvenio = (convenioId) => apiGet(`/api/convenios/${convenioId}/tarifas`);
export const upsertTarifa = (payload) => apiPutJson('/api/tarifas', payload);

export const getServicios = ({ todas } = {}) => apiGet(`/api/servicios${todas ? '?todas=true' : ''}`);
export const createServicio = (payload) => apiPostJson('/api/servicios', payload);
export const updateServicio = (id, payload) => apiPutJson(`/api/servicios/${id}`, payload);
export const setEstadoServicio = (id, activo) => apiPatchJson(`/api/servicios/${id}/estado`, { activo });
