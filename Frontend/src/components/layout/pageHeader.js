import { sidebarItems } from './sidebarConfig';

export function getBreadcrumb(pathname) {
  if (pathname.startsWith('/dashboard')) {
    return { module: 'Dashboard', page: null };
  }

  if (pathname.startsWith('/reportes')) {
    return { module: 'Reportes e Indicadores', page: 'Dashboard Gerencial' };
  }

  if (pathname.startsWith('/configuracion')) {
    return { module: 'Configuración', page: 'General' };
  }

  if (pathname.startsWith('/usuarios')) {
    const page = pathname === '/usuarios' ? 'Lista de Usuarios' : 'Crear / Editar Usuario';
    return { module: 'Gestión de Usuarios', page };
  }

  if (pathname.startsWith('/pacientes')) {
    let page = 'Lista de Pacientes';
    if (pathname === '/pacientes/nuevo') page = 'Nuevo Paciente';
    else if (pathname.endsWith('/editar')) page = 'Editar Paciente';
    else if (pathname !== '/pacientes') page = 'Perfil de Paciente';
    return { module: 'Gestión de Pacientes', page };
  }

  if (pathname.startsWith('/agenda')) {
    return { module: 'Agenda Médica', page: null };
  }

  if (pathname.startsWith('/admisiones')) {
    return { module: 'Admisiones', page: 'Nueva Admisión' };
  }

  if (pathname.startsWith('/historia-clinica')) {
    const page = pathname.includes('/atencion/') ? 'Atención Clínica' : 'Consultar Historia';
    return { module: 'Historia Clínica Electrónica', page };
  }

  if (pathname.startsWith('/formulas-ordenes')) {
    return { module: 'Fórmulas y Órdenes', page: null };
  }

  if (pathname.startsWith('/facturacion')) {
    return { module: 'Facturación', page: pathname === '/facturacion' ? 'Cuentas Médicas' : 'Detalle de Factura' };
  }

  if (pathname.startsWith('/caja-pagos')) {
    return { module: 'Caja y Pagos', page: 'Registro de Pagos' };
  }

  if (pathname.startsWith('/rips')) {
    return { module: 'RIPS', page: 'Generación y Validación' };
  }

  if (pathname.startsWith('/administracion/parametrizacion')) {
    return { module: 'Administración', page: 'Parametrización' };
  }

  if (pathname.startsWith('/administracion/sedes-consultorios')) {
    return { module: 'Administración', page: 'Sedes y Consultorios' };
  }

  for (const item of sidebarItems) {
    if (item.children) {
      const child = item.children.find((c) => pathname.startsWith(c.path));
      if (child) return { module: item.label, page: child.label };
    } else if (item.path && pathname.startsWith(item.path)) {
      return { module: item.label, page: null };
    }
  }

  return { module: 'HealthCore', page: null };
}
