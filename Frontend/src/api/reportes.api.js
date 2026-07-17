import { apiGet } from './client';

export const getIndicadores = ({ desde, hasta } = {}) => {
  const params = new URLSearchParams();
  if (desde) params.set('desde', desde);
  if (hasta) params.set('hasta', hasta);
  return apiGet(`/api/reportes/indicadores?${params}`);
};

export const descargarExcelReporte = async ({ desde, hasta } = {}) => {
  const params = new URLSearchParams();
  if (desde) params.set('desde', desde);
  if (hasta) params.set('hasta', hasta);
  const res = await fetch(`/api/reportes/exportar.xlsx?${params}`);
  if (!res.ok) throw new Error('No se pudo generar el archivo Excel.');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'reporte-indicadores.xlsx';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
