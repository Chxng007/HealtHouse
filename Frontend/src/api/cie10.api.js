import { apiGet } from './client';

export const searchCie10 = (search) => apiGet(`/api/cie10?search=${encodeURIComponent(search)}`);
