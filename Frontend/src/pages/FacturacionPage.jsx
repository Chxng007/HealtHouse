import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DataTable from '../components/common/DataTable';
import EstadoBadge from '../components/common/EstadoBadge';
import FacturaFormModal from '../components/facturacion/FacturaFormModal';
import { getStatsFacturas, listFacturas } from '../api/facturacion.api';
import { getConvenios, getServicios } from '../api/catalogosFacturacion.api';
import { getSedes } from '../api/sedes.api';
import { ESTADOS_FACTURA, estadoFactura, labelTipoContrato } from '../constants/facturacion';
import { formatFecha, formatMoneda } from '../utils/formato';
import styles from '../styles/facturacion/FacturacionPage.module.css';

const PAGE_SIZE = 10;

export default function FacturacionPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [sedes, setSedes] = useState([]);
  const [convenios, setConvenios] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [estado, setEstado] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [resultado, setResultado] = useState({ data: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  useEffect(() => {
    getSedes().then(setSedes).catch(() => setSedes([]));
    getConvenios().then(setConvenios).catch(() => setConvenios([]));
    getServicios().then(setServicios).catch(() => setServicios([]));
  }, []);

  useEffect(() => {
    getStatsFacturas().then(setStats).catch(() => setStats(null));
  }, []);

  useEffect(() => {
    let cancelado = false;
    setLoading(true);
    const timer = setTimeout(() => {
      listFacturas({ estado, search, page, pageSize: PAGE_SIZE })
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
  }, [estado, search, page]);

  const onFactura = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const columns = [
    { key: 'numero', header: 'Factura', width: '0.9fr', render: (f) => f.numero ?? <span style={{ color: 'var(--text-placeholder)' }}>Borrador</span> },
    {
      key: 'paciente',
      header: 'Paciente',
      width: '1.5fr',
      render: (f) => `${f.paciente.nombres} ${f.paciente.apellidos}`,
    },
    {
      key: 'eps',
      header: 'EPS / Convenio',
      width: '1.1fr',
      render: (f) => `${f.convenio.eps.nombre} · ${labelTipoContrato(f.convenio.tipoContrato)}`,
    },
    { key: 'fecha', header: 'Fecha', width: '0.8fr', render: (f) => formatFecha(f.fecha) },
    { key: 'valor', header: 'Valor', width: '0.9fr', render: (f) => formatMoneda(f.total) },
    {
      key: 'estado',
      header: 'Estado',
      width: '0.8fr',
      render: (f) => {
        const e = estadoFactura(f.estado);
        return <EstadoBadge variant={e.badge}>{e.label}</EstadoBadge>;
      },
    },
    {
      key: 'acciones',
      header: '',
      width: '0.6fr',
      align: 'right',
      render: (f) => (
        <Link to={`/facturacion/${f.id}`} className={styles.verBtn}>
          Ver <span className="msr" style={{ fontSize: 16 }}>chevron_right</span>
        </Link>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.statsGrid}>
        <div className={`card ${styles.statCard}`}>
          <div className={`${styles.statIcon} ${styles.tonePrimary}`}><span className="msr" style={{ fontSize: 23 }}>receipt_long</span></div>
          <div><div className={styles.statValor}>{formatMoneda(stats?.facturadoHoy)}</div><div className={styles.statLabel}>Facturado Hoy</div></div>
        </div>
        <div className={`card ${styles.statCard}`}>
          <div className={`${styles.statIcon} ${styles.toneAmber}`}><span className="msr" style={{ fontSize: 23 }}>hourglass_top</span></div>
          <div><div className={styles.statValor}>{formatMoneda(stats?.pendienteCobrar)}</div><div className={styles.statLabel}>Pendiente por Cobrar</div></div>
        </div>
        <div className={`card ${styles.statCard}`}>
          <div className={`${styles.statIcon} ${styles.toneDanger}`}><span className="msr" style={{ fontSize: 23 }}>report</span></div>
          <div><div className={styles.statValor}>{formatMoneda(stats?.enGlosa)}</div><div className={styles.statLabel}>En Glosa</div></div>
        </div>
        <div className={`card ${styles.statCard}`}>
          <div className={`${styles.statIcon} ${styles.toneSuccess}`}><span className="msr" style={{ fontSize: 23 }}>task_alt</span></div>
          <div><div className={styles.statValor}>{stats?.emitidasMes ?? '—'}</div><div className={styles.statLabel}>Facturas Emitidas (Mes)</div></div>
        </div>
      </div>

      <section className="card">
        <div className={styles.filtros}>
          <div className={styles.filtroSelect}>
            <select className="select" value={estado} onChange={onFactura(setEstado)}>
              <option value="">Todos los estados</option>
              {ESTADOS_FACTURA.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
            </select>
          </div>
          <div className={styles.filtroInput}>
            <span className="msr" style={{ fontSize: 18, color: 'var(--text-placeholder)' }}>search</span>
            <input type="text" placeholder="Buscar por factura o paciente" value={search} onChange={onFactura(setSearch)} />
          </div>
          <div className={styles.espaciador} />
          <button type="button" className="btn btnPrimary" onClick={() => setModalAbierto(true)}>
            <span className="msr" style={{ fontSize: 18 }}>add</span> Generar Factura
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <DataTable
          columns={columns}
          rows={resultado.data}
          loading={loading}
          emptyMessage="No se encontraron facturas"
          itemLabel="facturas"
          rowKey={(f) => f.id}
          pagination={{ page, pageSize: PAGE_SIZE, total: resultado.total, onPage: setPage }}
        />
      </section>

      <FacturaFormModal
        open={modalAbierto}
        sedes={sedes}
        convenios={convenios}
        servicios={servicios}
        onClose={() => setModalAbierto(false)}
        onCreada={(factura) => {
          setModalAbierto(false);
          navigate(`/facturacion/${factura.id}`);
        }}
      />
    </div>
  );
}
