export const TIPOS_ATENCION = [
  { value: 'consulta', label: 'Consulta Externa' },
  { value: 'procedimiento', label: 'Procedimiento' },
  { value: 'urgencia', label: 'Urgencia' },
];

export const ESTADOS_ADMISION = [
  { value: 'en_espera', label: 'En Espera', badge: 'warning' },
  { value: 'en_atencion', label: 'En Atención', badge: 'primary' },
  { value: 'atendido', label: 'Atendido', badge: 'success' },
  { value: 'cancelado', label: 'Cancelado', badge: 'danger' },
];

export const ACCIONES_ADMISION = {
  en_espera: [
    { estado: 'en_atencion', label: 'Iniciar Atención', variante: 'btnPrimary' },
    { estado: 'cancelado', label: 'Cancelar', variante: 'btnDanger' },
  ],
  en_atencion: [
    { estado: 'atendido', label: 'Marcar Atendido', variante: 'btnPrimary' },
    { estado: 'cancelado', label: 'Cancelar', variante: 'btnDanger' },
  ],
  atendido: [],
  cancelado: [],
};

export function estadoAdmision(value) {
  return ESTADOS_ADMISION.find((e) => e.value === value) ?? { label: value, badge: 'neutral' };
}

export function labelTipoAtencion(value) {
  return TIPOS_ATENCION.find((t) => t.value === value)?.label ?? value;
}
