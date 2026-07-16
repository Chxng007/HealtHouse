import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PacienteForm from '../components/pacientes/PacienteForm';
import { createPaciente, getPaciente, updatePaciente } from '../api/pacientes.api';

function mensajeDeError(err) {
  if (err.status === 409) return 'Ya existe un paciente con ese número de documento.';
  if (err.detalles) {
    const campos = Object.keys(err.detalles).join(', ');
    return `Revisa los campos: ${campos}`;
  }
  return err.message || 'Ocurrió un error al guardar.';
}

export default function PacienteFormPage({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState(null);
  const [cargando, setCargando] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (mode !== 'edit') {
      setPaciente(null);
      setCargando(false);
      return;
    }
    setCargando(true);
    getPaciente(id)
      .then(setPaciente)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, [mode, id]);

  const onSubmit = async (form, foto) => {
    setSaving(true);
    setError(null);
    try {
      const guardado = mode === 'edit'
        ? await updatePaciente(id, form, foto)
        : await createPaciente(form, foto);
      navigate(`/pacientes/${guardado.id}`);
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setSaving(false);
    }
  };

  if (cargando) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>Cargando paciente…</div>;
  }

  return (
    <PacienteForm
      mode={mode}
      paciente={paciente}
      onSubmit={onSubmit}
      saving={saving}
      error={error}
    />
  );
}
