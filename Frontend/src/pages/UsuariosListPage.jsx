import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DataTable from '../components/common/DataTable';
import EstadoBadge from '../components/common/EstadoBadge';
import { aplicarPlantillaUsuario, listUsuarios } from '../api/usuarios.api';
import { formatDocumento } from '../utils/formato';
import styles from '../styles/users/UsuariosListPage.module.css';

export default function UsuariosListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [procesando, setProcesando] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  const refrescar = useCallback(() => {
    setLoading(true);
    listUsuarios(search)
      .then((res) => {
        setUsuarios(res);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(refrescar, 300);
    return () => clearTimeout(timer);
  }, [refrescar]);

  const aplicarPlantilla = async (usuario) => {
    setProcesando(usuario.id);
    setMensaje(null);
    try {
      await aplicarPlantillaUsuario(usuario.id);
      setMensaje(`Plantilla del rol "${usuario.rol.nombre}" aplicada a ${usuario.nombres} ${usuario.apellidos}.`);
      refrescar();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(null);
    }
  };

  const columns = [
    {
      key: 'nombre',
      header: 'Nombre',
      width: '1.6fr',
      render: (u) => (
        <div>
          <div className={styles.nombre}>{u.nombres} {u.apellidos}</div>
          <div className={styles.correo}>{u.correo}</div>
        </div>
      ),
    },
    { key: 'documento', header: 'Documento', width: '1fr', render: (u) => formatDocumento(u.numeroDocumento) },
    { key: 'rol', header: 'Rol', width: '1.2fr', render: (u) => u.rol.nombre },
    { key: 'cargo', header: 'Cargo', width: '1.2fr', render: (u) => u.cargoProfesion },
    {
      key: 'estado',
      header: 'Estado',
      width: '0.8fr',
      render: (u) => <EstadoBadge variant={u.activo ? 'success' : 'neutral'}>{u.activo ? 'Activo' : 'Inactivo'}</EstadoBadge>,
    },
    {
      key: 'acciones',
      header: '',
      width: '1.6fr',
      align: 'right',
      render: (u) => (
        <div className={styles.acciones}>
          <button
            type="button"
            className="btn btnGhost"
            style={{ padding: '6px 12px', fontSize: 12 }}
            onClick={() => aplicarPlantilla(u)}
            disabled={procesando === u.id}
            title={`Reemplaza los permisos del usuario con la plantilla del rol "${u.rol.nombre}"`}
          >
            Aplicar Plantilla
          </button>
          <Link to={`/usuarios/${u.id}/editar`} className="btn btnGhost" style={{ padding: '6px 12px', fontSize: 12 }}>
            Editar
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <section className="card">
        <div className={styles.filtros}>
          <div className={styles.filtroInput}>
            <span className="msr" style={{ fontSize: 18, color: 'var(--text-placeholder)' }}>search</span>
            <input
              type="text"
              placeholder="Nombre, apellido, correo o documento"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.espaciador} />
          <button type="button" className="btn btnPrimary" onClick={() => navigate('/usuarios/nuevo')}>
            <span className="msr" style={{ fontSize: 18 }}>person_add</span> Nuevo Usuario
          </button>
        </div>

        {mensaje && <div className={styles.mensaje}>{mensaje}</div>}
        {error && <div className={styles.error}>{error}</div>}

        <DataTable columns={columns} rows={usuarios} loading={loading} emptyMessage="No se encontraron usuarios" itemLabel="usuarios" rowKey={(u) => u.id} />
      </section>
    </div>
  );
}
