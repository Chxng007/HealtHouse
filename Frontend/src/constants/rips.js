export const ESTADOS_RIPS = [
  { value: 'generado', label: 'Generado', badge: 'neutral' },
  { value: 'validado_ok', label: 'Validado sin Errores', badge: 'success' },
  { value: 'validado_con_errores', label: 'Validado con Errores', badge: 'danger' },
];

export const SEVERIDADES = {
  error: { icon: 'error', color: '#dc2626', label: 'Error', badge: 'danger' },
  advertencia: { icon: 'warning', color: '#d97706', label: 'Advertencia', badge: 'warning' },
  correcto: { icon: 'check_circle', color: '#16a34a', label: 'Correcto', badge: 'success' },
};

export function estadoRips(value) {
  return ESTADOS_RIPS.find((e) => e.value === value) ?? { label: value, badge: 'neutral' };
}

export function severidadDe(value) {
  return SEVERIDADES[value] ?? { icon: 'help', color: '#64748b', label: value, badge: 'neutral' };
}
