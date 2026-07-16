import { apiGet, apiPatchJson, apiPostForm, apiPutForm } from './client';

function buildFormData(payload, foto) {
  const fd = new FormData();
  fd.append('data', JSON.stringify(payload));
  if (foto) fd.append('foto', foto);
  return fd;
}

export const listPacientes = ({ search, documento, epsId, page = 1, pageSize = 10 } = {}) => {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (documento) params.set('documento', documento);
  if (epsId) params.set('epsId', epsId);
  params.set('page', page);
  params.set('pageSize', pageSize);
  return apiGet(`/api/pacientes?${params}`);
};

export const getStatsPacientes = () => apiGet('/api/pacientes/stats');

export const getPaciente = (id) => apiGet(`/api/pacientes/${id}`);

export const getHistorialPaciente = (id) => apiGet(`/api/pacientes/${id}/historial`);

export const createPaciente = (payload, foto) => apiPostForm('/api/pacientes', buildFormData(payload, foto));

export const updatePaciente = (id, payload, foto) =>
  apiPutForm(`/api/pacientes/${id}`, buildFormData(payload, foto));

export const setEstadoPaciente = (id, activo, motivo) =>
  apiPatchJson(`/api/pacientes/${id}/estado`, { activo, motivo });
