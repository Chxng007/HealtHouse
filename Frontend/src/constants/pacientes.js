export const SEXOS = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
  { value: 'intersexual', label: 'Intersexual' },
];

export const ESTADOS_CIVILES = [
  { value: 'soltero', label: 'Soltero(a)' },
  { value: 'casado', label: 'Casado(a)' },
  { value: 'union_libre', label: 'Unión Libre' },
  { value: 'separado', label: 'Separado(a)' },
  { value: 'divorciado', label: 'Divorciado(a)' },
  { value: 'viudo', label: 'Viudo(a)' },
];

export const GRUPOS_SANGUINEOS = [
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'AB', label: 'AB' },
  { value: 'O', label: 'O' },
];

export const RH = [
  { value: 'positivo', label: '+' },
  { value: 'negativo', label: '−' },
];

export const REGIMENES = [
  { value: 'contributivo', label: 'Contributivo' },
  { value: 'subsidiado', label: 'Subsidiado' },
  { value: 'especial', label: 'Especial' },
  { value: 'particular', label: 'Particular' },
];

export const ZONAS = [
  { value: 'urbana', label: 'Urbana' },
  { value: 'rural', label: 'Rural' },
];

export const PARENTESCOS = [
  'Padre',
  'Madre',
  'Esposo(a)',
  'Hijo(a)',
  'Hermano(a)',
  'Abuelo(a)',
  'Tío(a)',
  'Amigo(a)',
  'Otro',
];

export function labelDe(lista, value) {
  return lista.find((o) => o.value === value)?.label ?? value ?? '—';
}

export function edadDe(fechaNacimiento) {
  if (!fechaNacimiento) return null;
  const nacimiento = new Date(fechaNacimiento);
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad -= 1;
  return edad;
}
