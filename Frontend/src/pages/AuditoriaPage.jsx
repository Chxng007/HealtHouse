import { useEffect, useState } from 'react';
import DataTable from '../components/common/DataTable';
import EstadoBadge from '../components/common/EstadoBadge';
import Modal from '../components/common/Modal';
import { getAccionesAuditoria, getEntidadesAuditoria, listAuditLogs } from '../api/auditoria.api';
import { badgeDeAccion, labelDetalle } from '../constants/auditoria';
import { formatFecha } from '../utils/formato';
import { formatHora } from '../utils/fechas';
import styles from '../styles/users/AuditoriaPage.module.css';

const PAGE_SIZE = 20;

function descargarJson(logs) {
  const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `auditoria_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function AuditoriaPage() {
  const [entidades, setEntidades] = useState([]);
  const [acciones, setAcciones] = useState([]);
  const [entidad, setEntidad] = useState('');
  const [accion, setAccion] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [page, setPage] = useState(1);
  const [resultado, setResultado] = useState({ data: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detalleAbierto, setDetalleAbierto] = useState(null);

  useEffect(() => {
    getEntidadesAuditoria().then(setEntidades).catch(() => setEntidades([]));
    getAccionesAuditoria().then(setAcciones).catch(() => setAcciones([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    listAuditLogs({ entidad, accion, desde, hasta, page, pageSize: PAGE_SIZE })
      .then((res) => {
        setResultado(res);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [entidad, accion, desde, hasta, page]);

  const onFiltro = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const exportar = async () => {
    const completo = await listAuditLogs({ entidad, accion, desde, hasta, page: 1, pageSize: 1000 });
    descargarJson(completo.data);
  };

  const columns = [
    { key: 'fecha', header: 'Fecha y Hora', width: '1.1fr', render: (l) => `${formatFecha(l.createdAt)} ${formatHora(l.createdAt)}` },
    { key: 'usuario', header: 'Usuario', width: '1fr', render: () => 'Sistema' },
    { key: 'modulo', header: 'Módulo', width: '1fr', render: (l) => l.entidad },
    { key: 'accion', header: 'Acción', width: '1.1fr', render: (l) => <EstadoBadge variant={badgeDeAccion(l.accion)}>{l.accion}</EstadoBadge> },
    { key: 'detalle', header: 'Detalle', width: '1.8fr', render: (l) => <span className={styles.detalleTexto}>{labelDetalle(l.detalle)}</span> },
    { key: 'ip', header: 'IP', width: '0.9fr', render: (l) => <span className={styles.ip}>{l.ip ?? '—'}</span> },
    {
      key: 'acciones',
      header: '',
      width: '0.6fr',
      align: 'right',
      render: (l) => (
        <button type="button" className={styles.verBtn} onClick={() => setDetalleAbierto(l)}>Ver</button>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <section className={`card ${styles.filtrosCard}`}>
        <div>
          <div className="fieldLabel">Módulo</div>
          <select className="select" style={{ width: 180 }} value={entidad} onChange={onFiltro(setEntidad)}>
            <option value="">Todos los módulos</option>
            {entidades.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <div>
          <div className="fieldLabel">Acción</div>
          <select className="select" style={{ width: 220 }} value={accion} onChange={onFiltro(setAccion)}>
            <option value="">Todas</option>
            {acciones.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <div className="fieldLabel">Desde</div>
          <input className="input" type="date" value={desde} onChange={onFiltro(setDesde)} />
        </div>
        <div>
          <div className="fieldLabel">Hasta</div>
          <input className="input" type="date" value={hasta} onChange={onFiltro(setHasta)} />
        </div>
        <div className={styles.espaciador} />
        <button type="button" className="btn btnGhost" onClick={exportar}>
          <span className="msr" style={{ fontSize: 17 }}>download</span> Exportar Log
        </button>
      </section>

      {error && <div className={styles.error}>{error}</div>}

      <section className="card">
        <DataTable
          columns={columns}
          rows={resultado.data}
          loading={loading}
          emptyMessage="No se encontraron registros de auditoría"
          itemLabel="registros"
          rowKey={(l) => l.id}
          pagination={{ page, pageSize: PAGE_SIZE, total: resultado.total, onPage: setPage }}
        />
      </section>

      <Modal
        open={!!detalleAbierto}
        title="Detalle del Registro"
        onClose={() => setDetalleAbierto(null)}
      >
        {detalleAbierto && (
          <div className={styles.detalleModal}>
            <div><strong>Fecha:</strong> {formatFecha(detalleAbierto.createdAt)} {formatHora(detalleAbierto.createdAt)}</div>
            <div><strong>Entidad:</strong> {detalleAbierto.entidad} ({detalleAbierto.entidadId})</div>
            <div><strong>Acción:</strong> {detalleAbierto.accion}</div>
            <div><strong>IP:</strong> {detalleAbierto.ip ?? '—'}</div>
            <pre className={styles.detalleJson}>{JSON.stringify(detalleAbierto.detalle, null, 2)}</pre>
          </div>
        )}
      </Modal>
    </div>
  );
}
