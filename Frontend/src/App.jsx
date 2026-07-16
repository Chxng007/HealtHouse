import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import { sidebarItems } from './components/layout/sidebarConfig';
import ComingSoonPage from './pages/ComingSoonPage';
import PacienteFormPage from './pages/PacienteFormPage';
import PacientePerfilPage from './pages/PacientePerfilPage';
import PacientesListPage from './pages/PacientesListPage';
import UserFormPage from './pages/UserFormPage';

const IMPLEMENTED_PATHS = ['/usuarios', '/pacientes'];

function flattenComingSoonPaths() {
  const paths = [];
  const isImplemented = (path) => IMPLEMENTED_PATHS.some((p) => path.startsWith(p));
  for (const item of sidebarItems) {
    if (item.children) {
      for (const child of item.children) {
        if (!isImplemented(child.path)) paths.push(child.path);
      }
    } else if (item.path && !isImplemented(item.path)) {
      paths.push(item.path);
    }
  }
  return paths;
}

export default function App() {
  const comingSoonPaths = flattenComingSoonPaths();

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/pacientes" replace />} />
        <Route path="/usuarios/nuevo" element={<UserFormPage mode="create" />} />
        <Route path="/usuarios/:id/editar" element={<UserFormPage mode="edit" />} />
        <Route path="/pacientes" element={<PacientesListPage />} />
        <Route path="/pacientes/nuevo" element={<PacienteFormPage mode="create" />} />
        <Route path="/pacientes/:id" element={<PacientePerfilPage />} />
        <Route path="/pacientes/:id/editar" element={<PacienteFormPage mode="edit" />} />
        {comingSoonPaths.map((path) => (
          <Route key={path} path={path} element={<ComingSoonPage />} />
        ))}
      </Route>
    </Routes>
  );
}
