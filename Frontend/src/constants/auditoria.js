const PREFIJOS_CREACION = ['CREAR', 'EMITIR', 'GENERAR', 'REGISTRAR', 'FIRMAR', 'APLICAR'];
const PREFIJOS_ELIMINACION = ['ANULAR', 'DESACTIVAR'];

export function badgeDeAccion(accion) {
  if (PREFIJOS_CREACION.some((p) => accion.startsWith(p))) return 'success';
  if (PREFIJOS_ELIMINACION.some((p) => accion.startsWith(p))) return 'danger';
  return 'primary';
}

export function labelDetalle(detalle) {
  if (!detalle) return '—';
  return Object.entries(detalle)
    .filter(([, v]) => v !== null && v !== undefined)
    .map(([k, v]) => `${k}: ${v}`)
    .join(' · ');
}
