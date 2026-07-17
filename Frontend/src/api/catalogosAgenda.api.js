import { apiGet, apiPatchJson, apiPostJson, apiPutJson } from './client';

export const getMedicos = () => apiGet('/api/medicos');

export const getConsultorios = (sedeId, { todas } = {}) => {
  const params = new URLSearchParams();
  if (sedeId) params.set('sedeId', sedeId);
  if (todas) params.set('todas', 'true');
  return apiGet(`/api/consultorios?${params}`);
};
export const createConsultorio = (payload) => apiPostJson('/api/consultorios', payload);
export const updateConsultorio = (id, payload) => apiPutJson(`/api/consultorios/${id}`, payload);
export const setEstadoConsultorio = (id, activo) => apiPatchJson(`/api/consultorios/${id}/estado`, { activo });

export const getEspecialidades = ({ todas } = {}) => apiGet(`/api/especialidades${todas ? '?todas=true' : ''}`);
export const createEspecialidad = (payload) => apiPostJson('/api/especialidades', payload);
export const updateEspecialidad = (id, payload) => apiPutJson(`/api/especialidades/${id}`, payload);
export const setEstadoEspecialidad = (id, activo) => apiPatchJson(`/api/especialidades/${id}/estado`, { activo });
