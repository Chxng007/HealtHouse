export const TABS_FORMULAS_ORDENES = [
  { key: 'formula', label: 'Fórmula Médica' },
  { key: 'orden', label: 'Órdenes de Laboratorio' },
  { key: 'remision', label: 'Remisiones' },
  { key: 'incapacidad', label: 'Incapacidades' },
  { key: 'consentimiento', label: 'Consentimientos' },
];

export const PRIORIDADES_ORDEN = [
  { value: 'rutinaria', label: 'Rutinaria' },
  { value: 'prioritaria', label: 'Prioritaria' },
];

export const ESTADOS_DOCUMENTO = [
  { value: 'emitido', label: 'Emitido', badge: 'success' },
  { value: 'anulado', label: 'Anulado', badge: 'danger' },
];

export const ESTADOS_CONSENTIMIENTO = [
  { value: 'pendiente', label: 'Pendiente', badge: 'warning' },
  { value: 'firmado', label: 'Firmado', badge: 'success' },
  { value: 'anulado', label: 'Anulado', badge: 'danger' },
];

export function estadoDocumento(value) {
  return ESTADOS_DOCUMENTO.find((e) => e.value === value) ?? { label: value, badge: 'neutral' };
}

export function estadoConsentimiento(value) {
  return ESTADOS_CONSENTIMIENTO.find((e) => e.value === value) ?? { label: value, badge: 'neutral' };
}

export function labelPrioridad(value) {
  return PRIORIDADES_ORDEN.find((p) => p.value === value)?.label ?? value;
}
