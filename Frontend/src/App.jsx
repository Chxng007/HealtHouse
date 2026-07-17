import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import { sidebarItems } from './components/layout/sidebarConfig';
import AdmisionesPage from './pages/AdmisionesPage';
import AgendaPage from './pages/AgendaPage';
import AtencionPage from './pages/AtencionPage';
import CajaPagosPage from './pages/CajaPagosPage';
import ComingSoonPage from './pages/ComingSoonPage';
import FacturacionPage from './pages/FacturacionPage';
import FacturaDetallePage from './pages/FacturaDetallePage';
import FormulasOrdenesPage from './pages/FormulasOrdenesPage';
import HistoriaClinicaPage from './pages/HistoriaClinicaPage';
import PacienteFormPage from './pages/PacienteFormPage';
import PacientePerfilPage from './pages/PacientePerfilPage';
import PacientesListPage from './pages/PacientesListPage';
import AuditoriaPage from './pages/AuditoriaPage';
import ConfiguracionPage from './pages/ConfiguracionPage';
import DashboardPage from './pages/DashboardPage';
import ParametrizacionPage from './pages/ParametrizacionPage';
import ReportesPage from './pages/ReportesPage';
import RipsPage from './pages/RipsPage';
import RolesPermisosPage from './pages/RolesPermisosPage';
import SedesConsultoriosPage from './pages/SedesConsultoriosPage';
import UserFormPage from './pages/UserFormPage';
import UsuariosListPage from './pages/UsuariosListPage';

const IMPLEMENTED_PATHS = [
  '/dashboard', '/usuarios', '/pacientes', '/agenda', '/admisiones', '/historia-clinica',
  '/formulas-ordenes', '/facturacion', '/caja-pagos', '/rips',
  '/administracion/parametrizacion', '/administracion/sedes-consultorios',
  '/administracion/roles-permisos', '/administracion/auditoria',
  '/reportes', '/configuracion',
];

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
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/usuarios" element={<UsuariosListPage />} />
        <Route path="/usuarios/nuevo" element={<UserFormPage mode="create" />} />
        <Route path="/usuarios/:id/editar" element={<UserFormPage mode="edit" />} />
        <Route path="/pacientes" element={<PacientesListPage />} />
        <Route path="/pacientes/nuevo" element={<PacienteFormPage mode="create" />} />
        <Route path="/pacientes/:id" element={<PacientePerfilPage />} />
        <Route path="/pacientes/:id/editar" element={<PacienteFormPage mode="edit" />} />
        <Route path="/agenda" element={<AgendaPage />} />
        <Route path="/admisiones" element={<AdmisionesPage />} />
        <Route path="/historia-clinica" element={<HistoriaClinicaPage />} />
        <Route path="/historia-clinica/atencion/:id" element={<AtencionPage />} />
        <Route path="/formulas-ordenes" element={<FormulasOrdenesPage />} />
        <Route path="/facturacion" element={<FacturacionPage />} />
        <Route path="/facturacion/:id" element={<FacturaDetallePage />} />
        <Route path="/caja-pagos" element={<CajaPagosPage />} />
        <Route path="/rips" element={<RipsPage />} />
        <Route path="/administracion/parametrizacion" element={<ParametrizacionPage />} />
        <Route path="/administracion/sedes-consultorios" element={<SedesConsultoriosPage />} />
        <Route path="/administracion/roles-permisos" element={<RolesPermisosPage />} />
        <Route path="/administracion/auditoria" element={<AuditoriaPage />} />
        <Route path="/reportes" element={<ReportesPage />} />
        <Route path="/configuracion" element={<ConfiguracionPage />} />
        {comingSoonPaths.map((path) => (
          <Route key={path} path={path} element={<ComingSoonPage />} />
        ))}
      </Route>
    </Routes>
  );
}
