import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import { sidebarItems } from './components/layout/sidebarConfig';
import ComingSoonPage from './pages/ComingSoonPage';
import UserFormPage from './pages/UserFormPage';

function flattenComingSoonPaths() {
  const paths = [];
  for (const item of sidebarItems) {
    if (item.children) {
      for (const child of item.children) {
        if (!child.path.startsWith('/usuarios')) paths.push(child.path);
      }
    } else if (item.path) {
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
        <Route path="/" element={<Navigate to="/usuarios/nuevo" replace />} />
        <Route path="/usuarios/nuevo" element={<UserFormPage mode="create" />} />
        <Route path="/usuarios/:id/editar" element={<UserFormPage mode="edit" />} />
        {comingSoonPaths.map((path) => (
          <Route key={path} path={path} element={<ComingSoonPage />} />
        ))}
      </Route>
    </Routes>
  );
}
