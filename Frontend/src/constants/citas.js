export const ESTADOS_CITA = [
  { value: 'agendada', label: 'Agendada' },
  { value: 'confirmada', label: 'Confirmada' },
  { value: 'en_atencion', label: 'En Atención' },
  { value: 'atendida', label: 'Atendida' },
  { value: 'cancelada', label: 'Cancelada' },
  { value: 'no_asistio', label: 'No Asistió' },
];

export const DURACIONES_CITA = [
  { value: 15, label: '15 minutos' },
  { value: 20, label: '20 minutos' },
  { value: 30, label: '30 minutos' },
  { value: 45, label: '45 minutos' },
  { value: 60, label: '1 hora' },
];

export function labelEstadoCita(estado) {
  return ESTADOS_CITA.find((e) => e.value === estado)?.label ?? estado;
}

// Acciones disponibles según la máquina de estados del backend.
export const ACCIONES_POR_ESTADO = {
  agendada: ['confirmada', 'en_atencion', 'cancelada', 'no_asistio'],
  confirmada: ['en_atencion', 'cancelada', 'no_asistio'],
  en_atencion: ['atendida', 'cancelada'],
  atendida: [],
  cancelada: [],
  no_asistio: [],
};

export const LABEL_ACCION = {
  confirmada: 'Confirmar',
  en_atencion: 'Iniciar Atención',
  atendida: 'Marcar Atendida',
  cancelada: 'Cancelar Cita',
  no_asistio: 'No Asistió',
};
