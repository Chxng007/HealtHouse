export const PERMISOS_MODULOS = [
  { modulo: 'pacientes', label: 'Pacientes', icono: 'groups', iconColor: '#2563eb' },
  { modulo: 'historia_clinica', label: 'Historia Clínica', icono: 'clinical_notes', iconColor: '#2563eb' },
  { modulo: 'agenda', label: 'Agenda', icono: 'calendar_month', iconColor: '#2563eb' },
  { modulo: 'formulas_ordenes', label: 'Fórmulas y Órdenes', icono: 'prescriptions', iconColor: '#2563eb' },
  { modulo: 'reportes', label: 'Reportes', icono: 'monitoring', iconColor: '#2563eb' },
  { modulo: 'administracion', label: 'Administración', icono: 'settings', iconColor: '#64748b' },
];

export const PERMISOS_HEADERS = ['Ver', 'Crear', 'Editar', 'Eliminar', 'Imprimir', 'Exportar'];

export const PERMISOS_DEFAULT = {
  pacientes: { ver: true, crear: true, editar: true, eliminar: false, imprimir: true, exportar: true },
  historia_clinica: { ver: true, crear: true, editar: true, eliminar: false, imprimir: true, exportar: true },
  agenda: { ver: true, crear: false, editar: false, eliminar: false, imprimir: false, exportar: false },
  formulas_ordenes: { ver: true, crear: true, editar: true, eliminar: false, imprimir: true, exportar: false },
  reportes: { ver: true, crear: false, editar: false, eliminar: false, imprimir: true, exportar: true },
  administracion: { ver: false, crear: false, editar: false, eliminar: false, imprimir: false, exportar: false },
};
