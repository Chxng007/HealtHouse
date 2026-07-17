import { apiGet } from './client';

export const getDashboardKpis = () => apiGet('/api/dashboard/kpis');
