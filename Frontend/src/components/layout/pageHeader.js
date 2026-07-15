import { sidebarItems } from './sidebarConfig';

export function getBreadcrumb(pathname) {
  if (pathname.startsWith('/usuarios')) {
    return { module: 'Gestión de Usuarios', page: 'Crear / Editar Usuario' };
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
