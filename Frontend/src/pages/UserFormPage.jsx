import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import UserForm from '../components/users/UserForm';
import { getRoles } from '../api/roles.api';
import { getSedes } from '../api/sedes.api';
import { getUsuario, createUsuario, updateUsuario, setEstadoUsuario } from '../api/usuarios.api';

function formatError(err) {
  if (err.detalles) {
    const firstField = Object.keys(err.detalles)[0];
    const firstMessage = err.detalles[firstField]?.[0];
    return firstMessage ? `${err.message}: ${firstMessage}` : err.message;
  }
  return err.message;
}

export default function UserFormPage({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [rolesData, sedesData, usuarioData] = await Promise.all([
          getRoles(),
          getSedes(),
          mode === 'edit' ? getUsuario(id) : Promise.resolve(null),
        ]);
        if (cancelled) return;
        setRoles(rolesData);
        setSedes(sedesData);
        setUsuario(usuarioData);
      } catch (err) {
        if (!cancelled) setError(formatError(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [mode, id]);

  async function handleSubmit(payload, fotoFile) {
    setSaving(true);
    setError(null);
    try {
      const result =
        mode === 'edit' ? await updateUsuario(id, payload, fotoFile) : await createUsuario(payload, fotoFile);
      navigate(`/usuarios/${result.id}/editar`, { replace: true });
    } catch (err) {
      setError(formatError(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDesactivar(nuevoEstado) {
    if (mode !== 'edit') return;
    setSaving(true);
    setError(null);
    try {
      const result = await setEstadoUsuario(id, nuevoEstado);
      setUsuario(result);
    } catch (err) {
      setError(formatError(err));
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    navigate(-1);
  }

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
        Cargando...
      </div>
    );
  }

  return (
    <UserForm
      key={usuario?.updatedAt ?? 'new'}
      mode={mode}
      initialData={usuario}
      roles={roles}
      sedes={sedes}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      onDesactivar={handleDesactivar}
      saving={saving}
      error={error}
    />
  );
}
