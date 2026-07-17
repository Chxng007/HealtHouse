import { apiGet, apiPutJson } from './client';

export const getConfiguracion = (clave) => apiGet(`/api/configuracion/${clave}`);
export const setConfiguracion = (clave, valor) => apiPutJson(`/api/configuracion/${clave}`, { valor });
