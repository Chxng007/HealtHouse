import { useState } from 'react';
import styles from './UserForm.module.css';
import UserFormTabs from './UserFormTabs';
import UserFormFooter from './UserFormFooter';
import InfoUsuarioSection from './InfoUsuarioSection';
import PermisosRapidosSection from './PermisosRapidosSection';
import AsignacionRolSection from './AsignacionRolSection';
import SedesPermitidasSection from './SedesPermitidasSection';
import InfoAdicionalSection from './InfoAdicionalSection';
import { CARGOS } from '../../constants/cargos';
import { PERMISOS_MODULOS, PERMISOS_DEFAULT } from '../../constants/permisosModulos';

function buildInitialValues(usuario) {
  if (!usuario) {
    return {
      nombres: '',
      apellidos: '',
      tipoDocumento: 'CC',
      numeroDocumento: '',
      correo: '',
      telefono: '',
      cargoProfesion: CARGOS[0],
      rolId: '',
      activo: true,
      password: '',
      mustChangePassword: true,
    };
  }
  return {
    nombres: usuario.nombres,
    apellidos: usuario.apellidos,
    tipoDocumento: usuario.tipoDocumento,
    numeroDocumento: usuario.numeroDocumento,
    correo: usuario.correo,
    telefono: usuario.telefono ?? '',
    cargoProfesion: usuario.cargoProfesion,
    rolId: usuario.rolId,
    activo: usuario.activo,
    password: '',
    mustChangePassword: usuario.mustChangePassword,
  };
}

function buildInitialPermisos(usuario) {
  const base = {};
  for (const mod of PERMISOS_MODULOS) {
    const existente = usuario?.permisos?.find((p) => p.modulo === mod.modulo);
    base[mod.modulo] = existente
      ? {
          ver: existente.ver,
          crear: existente.crear,
          editar: existente.editar,
          eliminar: existente.eliminar,
          imprimir: existente.imprimir,
          exportar: existente.exportar,
        }
      : { ...PERMISOS_DEFAULT[mod.modulo] };
  }
  return base;
}

export default function UserForm({ mode, initialData, roles, sedes, onSubmit, onCancel, onDesactivar, saving, error }) {
  const isEditMode = mode === 'edit';
  const [activeTab, setActiveTab] = useState('Información General');
  const [values, setValues] = useState(() => buildInitialValues(initialData));
  const [permisos, setPermisos] = useState(() => buildInitialPermisos(initialData));
  const [sedeIds, setSedeIds] = useState(() => initialData?.sedes?.map((s) => s.id) ?? []);
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(initialData?.fotoUrl ?? null);

  function handleChange(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function handleTogglePermiso(modulo, campo, value) {
    setPermisos((prev) => ({ ...prev, [modulo]: { ...prev[modulo], [campo]: value } }));
  }

  function handleToggleSede(sedeId) {
    setSedeIds((prev) => (prev.includes(sedeId) ? prev.filter((id) => id !== sedeId) : [...prev, sedeId]));
  }

  function handleFotoSelect(file) {
    setFotoFile(file);
    setFotoPreview(URL.createObjectURL(file));
  }

  function handleLimpiar() {
    setValues(buildInitialValues(initialData));
    setPermisos(buildInitialPermisos(initialData));
    setSedeIds(initialData?.sedes?.map((s) => s.id) ?? []);
    setFotoFile(null);
    setFotoPreview(initialData?.fotoUrl ?? null);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      ...values,
      telefono: values.telefono || undefined,
      sedeIds,
      permisos: PERMISOS_MODULOS.map((m) => ({ modulo: m.modulo, ...permisos[m.modulo] })),
    };
    if (isEditMode && !payload.password) delete payload.password;
    onSubmit(payload, fotoFile);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <UserFormTabs activeTab={activeTab} onTabChange={setActiveTab} onCancel={onCancel} saving={saving} />

      {activeTab === 'Información General' ? (
        <main className={styles.main}>
          {error && <div className={styles.errorBanner}>{error}</div>}
          <div className={styles.leftCol}>
            <InfoUsuarioSection
              values={values}
              onChange={handleChange}
              roles={roles}
              isEditMode={isEditMode}
              createdAt={initialData?.createdAt}
              fotoPreview={fotoPreview}
              onFotoSelect={handleFotoSelect}
            />
            <PermisosRapidosSection permisos={permisos} onToggle={handleTogglePermiso} />
          </div>
          <div className={styles.rightCol}>
            <AsignacionRolSection roles={roles} rolId={values.rolId} onSelect={(id) => handleChange('rolId', id)} />
            <SedesPermitidasSection sedes={sedes} sedeIds={sedeIds} onToggle={handleToggleSede} />
            {isEditMode && initialData && <InfoAdicionalSection usuario={initialData} />}
          </div>
        </main>
      ) : (
        <div className={styles.placeholder}>Contenido disponible próximamente.</div>
      )}

      <UserFormFooter
        isEditMode={isEditMode}
        activo={values.activo}
        onDesactivar={() => onDesactivar(!values.activo)}
        onLimpiar={handleLimpiar}
        saving={saving}
      />
    </form>
  );
}
