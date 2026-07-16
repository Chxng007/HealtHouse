import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DataTable from '../components/common/DataTable';
import EstadoBadge from '../components/common/EstadoBadge';
import PacienteAvatar from '../components/pacientes/PacienteAvatar';
import PacienteStatsCards from '../components/pacientes/PacienteStatsCards';
import { getEps } from '../api/eps.api';
import { getStatsPacientes, listPacientes } from '../api/pacientes.api';
import { REGIMENES, SEXOS, edadDe, labelDe } from '../constants/pacientes';
import { formatDocumento, formatFecha } from '../utils/formato';
import styles from '../styles/pacientes/PacientesListPage.module.css';

const PAGE_SIZE = 10;

export default function PacientesListPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [epsList, setEpsList] = useState([]);
  const [documento, setDocumento] = useState('');
  const [search, setSearch] = useState('');
  const [epsId, setEpsId] = useState('');
  const [page, setPage] = useState(1);
  const [resultado, setResultado] = useState({ data: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getStatsPacientes().then(setStats).catch(() => setStats(null));
    getEps().then(setEpsList).catch(() => setEpsList([]));
  }, []);

  useEffect(() => {
    let cancelado = false;
    setLoading(true);
    const timer = setTimeout(() => {
      listPacientes({ search, documento, epsId, page, pageSize: PAGE_SIZE })
        .then((res) => {
          if (!cancelado) {
            setResultado(res);
            setError(null);
          }
        })
        .catch((err) => !cancelado && setError(err.message))
        .finally(() => !cancelado && setLoading(false));
    }, 300);
    return () => {
      cancelado = true;
      clearTimeout(timer);
    };
  }, [search, documento, epsId, page]);

  const onFiltro = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const columns = [
    {
      key: 'foto',
      header: '',
      width: '56px',
      render: (p) => <PacienteAvatar paciente={p} />,
    },
    {
      key: 'paciente',
      header: 'Paciente',
      width: '1.6fr',
      render: (p) => (
        <div>
          <div className={styles.nombre}>{p.nombres} {p.apellidos}</div>
          <div className={styles.sexo}>{labelDe(SEXOS, p.sexo)}</div>
        </div>
      ),
    },
    { key: 'documento', header: 'Documento', width: '1.1fr', render: (p) => formatDocumento(p.numeroDocumento) },
    {
      key: 'edad',
      header: 'Edad',
      width: '0.6fr',
      render: (p) => `${edadDe(p.fechaNacimiento)} años`,
    },
    {
      key: 'eps',
      header: 'EPS / Régimen',
      width: '1fr',
      render: (p) => (
        <div>
          <div className={styles.epsNombre}>{p.eps?.nombre}</div>
          <div className={styles.regimen}>{labelDe(REGIMENES, p.regimen)}</div>
        </div>
      ),
    },
    { key: 'telefono', header: 'Teléfono', width: '1fr' },
    {
      key: 'ultimaAtencion',
      header: 'Última Atención',
      width: '1fr',
      render: (p) => (p.ultimaAtencion ? formatFecha(p.ultimaAtencion) : '—'),
    },
    {
      key: 'estado',
      header: 'Estado',
      width: '0.9fr',
      render: (p) => (
        <EstadoBadge variant={p.activo ? 'success' : 'neutral'}>{p.activo ? 'Activo' : 'Inactivo'}</EstadoBadge>
      ),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      width: '1fr',
      align: 'right',
      render: (p) => (
        <div className={styles.acciones}>
          <Link to={`/pacientes/${p.id}`} className={`${styles.accionBtn} ${styles.accionVer}`} title="Ver perfil">
            <span className="msr" style={{ fontSize: 17 }}>visibility</span>
          </Link>
          <Link to={`/pacientes/${p.id}/editar`} className={styles.accionBtn} title="Editar">
            <span className="msr" style={{ fontSize: 17 }}>edit</span>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <PacienteStatsCards stats={stats} />

      <section className="card">
        <div className={styles.filtros}>
          <div className={styles.filtroInput}>
            <span className="msr" style={{ fontSize: 18, color: 'var(--text-placeholder)' }}>badge</span>
            <input
              type="text"
              placeholder="No. de documento"
              value={documento}
              onChange={onFiltro(setDocumento)}
            />
          </div>
          <div className={styles.filtroInput}>
            <span className="msr" style={{ fontSize: 18, color: 'var(--text-placeholder)' }}>person_search</span>
            <input
              type="text"
              placeholder="Nombre o apellido"
              value={search}
              onChange={onFiltro(setSearch)}
            />
          </div>
          <div className={styles.filtroSelect}>
            <select className="select" value={epsId} onChange={onFiltro(setEpsId)}>
              <option value="">Todas las EPS</option>
              {epsList.map((eps) => (
                <option key={eps.id} value={eps.id}>{eps.nombre}</option>
              ))}
            </select>
            <span className={`msr ${styles.selectChevron}`}>expand_more</span>
          </div>
          <div className={styles.espaciador} />
          <button type="button" className="btn btnPrimary" onClick={() => navigate('/pacientes/nuevo')}>
            <span className="msr" style={{ fontSize: 18 }}>person_add</span> Nuevo Paciente
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <DataTable
          columns={columns}
          rows={resultado.data}
          loading={loading}
          emptyMessage="No se encontraron pacientes"
          itemLabel="pacientes"
          pagination={{
            page,
            pageSize: PAGE_SIZE,
            total: resultado.total,
            onPage: setPage,
          }}
        />
      </section>
    </div>
  );
}
