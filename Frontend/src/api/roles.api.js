import { apiGet, apiPutJson } from './client';

export const getRoles = () => apiGet('/api/roles');
export const getPermisosRol = (id) => apiGet(`/api/roles/${id}/permisos`);
export const setPermisosRol = (id, permisos) => apiPutJson(`/api/roles/${id}/permisos`, { permisos });
