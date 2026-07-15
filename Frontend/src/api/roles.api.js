import { apiGet } from './client';

export const getRoles = () => apiGet('/api/roles');
