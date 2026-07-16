import { apiGet, apiPatchJson, apiPostJson } from './client';

export const listAdmisiones = ({ sedeId, estado } = {}) => {
  const params = new URLSearchParams();
  if (sedeId) params.set('sedeId', sedeId);
  if (estado) params.set('estado', estado);
  return apiGet(`/api/admisiones?${params}`);
};

export const getListaEspera = (sedeId) =>
  apiGet(`/api/admisiones/espera${sedeId ? `?sedeId=${sedeId}` : ''}`);

export const createAdmision = (payload) => apiPostJson('/api/admisiones', payload);

export const setEstadoAdmision = (id, estado) => apiPatchJson(`/api/admisiones/${id}/estado`, { estado });

export const getCitasHoyDePaciente = (pacienteId) => {
  const desde = new Date();
  desde.setHours(0, 0, 0, 0);
  const hasta = new Date(desde);
  hasta.setDate(hasta.getDate() + 1);
  const params = new URLSearchParams({
    desde: desde.toISOString(),
    hasta: hasta.toISOString(),
    pacienteId,
  });
  return apiGet(`/api/citas?${params}`);
};
