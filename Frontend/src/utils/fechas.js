const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export const DIAS_SEMANA_CORTOS = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

export function startOfWeek(fecha) {
  const d = new Date(fecha);
  const dia = (d.getDay() + 6) % 7; // lunes = 0
  d.setDate(d.getDate() - dia);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function startOfMonth(fecha) {
  const d = new Date(fecha);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(fecha, dias) {
  const d = new Date(fecha);
  d.setDate(d.getDate() + dias);
  return d;
}

export function addMonths(fecha, meses) {
  const d = new Date(fecha);
  d.setMonth(d.getMonth() + meses);
  return d;
}

export function mismoDia(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function esHoy(fecha) {
  return mismoDia(fecha, new Date());
}

export function toISODateLocal(fecha) {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function labelRangoSemana(inicioSemana, dias = 5) {
  const fin = addDays(inicioSemana, dias - 1);
  const mesInicio = MESES[inicioSemana.getMonth()];
  const mesFin = MESES[fin.getMonth()];
  if (inicioSemana.getMonth() === fin.getMonth()) {
    return `${inicioSemana.getDate()} – ${fin.getDate()} de ${mesInicio}, ${fin.getFullYear()}`;
  }
  return `${inicioSemana.getDate()} de ${mesInicio} – ${fin.getDate()} de ${mesFin}, ${fin.getFullYear()}`;
}

export function labelDia(fecha) {
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return `${dias[fecha.getDay()]}, ${fecha.getDate()} de ${MESES[fecha.getMonth()]} ${fecha.getFullYear()}`;
}

export function labelMes(fecha) {
  return `${MESES[fecha.getMonth()]} ${fecha.getFullYear()}`;
}

export function formatHora(fecha) {
  return new Date(fecha).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit', hour12: true })
    .replace('a. m.', 'a.m.')
    .replace('p. m.', 'p.m.');
}
