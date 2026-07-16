export function formatDocumento(numero) {
  if (!numero) return '—';
  if (!/^\d+$/.test(numero)) return numero;
  return Number(numero).toLocaleString('es-CO');
}

export function formatFecha(fecha) {
  if (!fecha) return '—';
  const d = new Date(fecha);
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' });
}
