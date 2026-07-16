import { sidebarItems } from './sidebarConfig';

export function getBreadcrumb(pathname) {
  if (pathname.startsWith('/usuarios')) {
    return { module: 'Gestión de Usuarios', page: 'Crear / Editar Usuario' };
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
