export const sidebarItems = [
  { icon: 'dashboard', label: 'Dashboard', path: '/dashboard' },
  { icon: 'groups', label: 'Pacientes', path: '/pacientes' },
  { icon: 'calendar_month', label: 'Agenda', path: '/agenda' },
  { icon: 'clinical_notes', label: 'Historia Clínica', path: '/historia-clinica' },
  { icon: 'how_to_reg', label: 'Admisiones', path: '/admisiones' },
  { icon: 'prescriptions', label: 'Fórmulas y Órdenes', path: '/formulas-ordenes' },
  { icon: 'receipt_long', label: 'Facturación', path: '/facturacion' },
  { icon: 'payments', label: 'Caja y Pagos', path: '/caja-pagos' },
  { icon: 'description', label: 'RIPS', path: '/rips' },
  {
    icon: 'admin_panel_settings',
    label: 'Administración',
    children: [
      { label: 'Usuarios', path: '/usuarios/nuevo' },
      { label: 'Roles y Permisos', path: '/administracion/roles-permisos' },
      { label: 'Sedes y Consultorios', path: '/administracion/sedes-consultorios' },
      { label: 'Parametrización', path: '/administracion/parametrizacion' },
      { label: 'Auditoría', path: '/administracion/auditoria' },
    ],
  },
  { icon: 'monitoring', label: 'Reportes e Indicadores', path: '/reportes' },
  { icon: 'settings', label: 'Configuración', path: '/configuracion' },
];
