export const TIPOS_DIAGNOSTICO = [
  { value: 'principal', label: 'Principal' },
  { value: 'secundario', label: 'Secundario' },
  { value: 'complicacion', label: 'Complicación' },
];

export const CONDICIONES_DIAGNOSTICO = [
  { value: 'confirmado', label: 'Confirmado', badge: 'success' },
  { value: 'impresion_diagnostica', label: 'Impresión Dx', badge: 'warning' },
];

export const ESTADOS_ATENCION = [
  { value: 'en_curso', label: 'Consulta en Curso', badge: 'primary' },
  { value: 'cerrada', label: 'Cerrada', badge: 'success' },
  { value: 'anulada', label: 'Anulada', badge: 'danger' },
];

export const SIGNOS_VITALES_CAMPOS = [
  { key: 'taSistolica', label: 'T.A. Sistólica (mmHg)' },
  { key: 'taDiastolica', label: 'T.A. Diastólica (mmHg)' },
  { key: 'fc', label: 'F.C. (lpm)' },
  { key: 'fr', label: 'F.R. (rpm)' },
  { key: 'temperatura', label: 'Temp (°C)' },
  { key: 'peso', label: 'Peso (kg)' },
  { key: 'talla', label: 'Talla (cm)' },
  { key: 'spo2', label: 'SatO2 (%)' },
];

export function labelTipoDiagnostico(value) {
  return TIPOS_DIAGNOSTICO.find((t) => t.value === value)?.label ?? value;
}

export function condicionDiagnostico(value) {
  return CONDICIONES_DIAGNOSTICO.find((c) => c.value === value) ?? { label: value, badge: 'neutral' };
}

export function estadoAtencion(value) {
  return ESTADOS_ATENCION.find((e) => e.value === value) ?? { label: value, badge: 'neutral' };
}

export function calcularImc(peso, talla) {
  if (!peso || !talla) return null;
  const tallaMetros = Number(talla) / 100;
  return Math.round((Number(peso) / (tallaMetros * tallaMetros)) * 10) / 10;
}

const TRAZA_LABELS = {
  CREAR_ATENCION: 'Atención creada',
  EDITAR_ATENCION: 'Datos de la atención actualizados',
  CERRAR_ATENCION: 'Consulta finalizada',
  ANULAR_ATENCION: 'Atención anulada',
};

export function labelTraza(accion) {
  return TRAZA_LABELS[accion] ?? accion;
}
