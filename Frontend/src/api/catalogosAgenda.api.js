import { apiGet } from './client';

export const getMedicos = () => apiGet('/api/medicos');

export const getConsultorios = (sedeId) =>
  apiGet(`/api/consultorios${sedeId ? `?sedeId=${sedeId}` : ''}`);

export const getEspecialidades = () => apiGet('/api/especialidades');
