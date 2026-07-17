import { useEffect, useState } from 'react';
import DataTable from '../common/DataTable';
import EstadoBadge from '../common/EstadoBadge';
import CatalogoFormModal from './CatalogoFormModal';

export default function CatalogoTab({
  tipoLabel,
  listFn,
  createFn,
  updateFn,
  setEstadoFn,
  estadoField = 'activo',
  columns,
  camposIniciales,
  renderCampos,
  payloadDeCampos,
}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalItem, setModalItem] = useState(undefined);
  const [procesando, setProcesando] = useState(null);

  const refrescar = () => {
    setLoading(true);
    listFn({ todas: true })
      .then((res) => {
        setRows(res);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(refrescar, []);

  const cambiarEstado = async (row) => {
    setProcesando(row.id);
    try {
      await setEstadoFn(row.id, !row[estadoField]);
      refrescar();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(null);
    }
  };

  const guardar = async (payload, item) => {
    if (item) await updateFn(item.id, payload);
    else await createFn(payload);
    refrescar();
  };

  const columnasFinales = [
    ...columns,
    {
      key: 'estado',
      header: 'Estado',
      width: '0.8fr',
      render: (row) => <EstadoBadge variant={row[estadoField] ? 'success' : 'neutral'}>{row[estadoField] ? 'Activo' : 'Inactivo'}</EstadoBadge>,
    },
    {
      key: 'acciones',
      header: '',
      width: '1.1fr',
      align: 'right',
      render: (row) => (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          {updateFn && (
            <button type="button" className="btn btnGhost" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => setModalItem(row)}>
              Editar
            </button>
          )}
          <button
            type="button"
            className={`btn ${row[estadoField] ? 'btnDanger' : 'btnGhost'}`}
            style={{ padding: '6px 12px', fontSize: 12 }}
            onClick={() => cambiarEstado(row)}
            disabled={procesando === row.id}
          >
            {row[estadoField] ? 'Desactivar' : 'Activar'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <section className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-heading)' }}>{tipoLabel}</div>
        <button type="button" className="btn btnPrimary" style={{ padding: '9px 16px', fontSize: 12.5 }} onClick={() => setModalItem(null)}>
          <span className="msr" style={{ fontSize: 16 }}>add</span> Agregar
        </button>
      </div>
      {error && (
        <div style={{ margin: '14px 24px 0 24px', background: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-border)', color: 'var(--color-danger-dark)', borderRadius: 9, padding: '10px 14px', fontSize: 13, fontWeight: 600 }}>
          {error}
        </div>
      )}
      <DataTable columns={columnasFinales} rows={rows} loading={loading} emptyMessage={`Sin registros de ${tipoLabel.toLowerCase()}`} itemLabel="registros" />

      <CatalogoFormModal
        open={modalItem !== undefined}
        titulo={modalItem ? `Editar ${tipoLabel}` : `Agregar ${tipoLabel}`}
        item={modalItem}
        camposIniciales={camposIniciales}
        renderCampos={renderCampos}
        payloadDeCampos={payloadDeCampos}
        onGuardar={guardar}
        onClose={() => setModalItem(undefined)}
      />
    </section>
  );
}
