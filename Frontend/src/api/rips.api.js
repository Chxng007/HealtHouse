import { apiGet, apiPostJson } from './client';

export const listRips = () => apiGet('/api/rips');
export const getRips = (id) => apiGet(`/api/rips/${id}`);
export const generarRips = (payload) => apiPostJson('/api/rips/generar', payload);
