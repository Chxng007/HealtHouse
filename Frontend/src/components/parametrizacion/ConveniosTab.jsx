import { useEffect, useState } from 'react';
import DataTable from '../common/DataTable';
import EstadoBadge from '../common/EstadoBadge';
import CatalogoFormModal from './CatalogoFormModal';
import { createConvenio, getConvenios, setEstadoConvenio } from '../../api/catalogosFacturacion.api';
import { labelTipoContrato } from '../../constants/facturacion';

export default function ConveniosTab({ epsList }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [procesando, setProcesando] = useState(null);

  const refrescar = () => {
    setLoading(true);
    getConvenios({ todas: true }).then(setRows).catch((err) => setError(err.message)).finally(() => setLoading(false));
  };
  useEffect(refrescar, []);

  const cambiarEstado = async (row) => {
    setProcesando(row.id);
    try {
      await setEstadoConvenio(row.id, !row.activo);
      refrescar();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(null);
    }
  };

  const columns = [
    { key: 'eps', header: 'EPS / Entidad', width: '1.4fr', render: (r) => r.eps.nombre },
    { key: 'tipo', header: 'Tipo de Contrato', width: '1fr', render: (r) => labelTipoContrato(r.tipoContrato) },
    {
      key: 'estado',
      header: 'Estado',
      width: '0.8fr',
      render: (r) => <EstadoBadge variant={r.activo ? 'success' : 'neutral'}>{r.activo ? 'Vigente' : 'Inactivo'}</EstadoBadge>,
    },
    {
      key: 'acciones',
      header: '',
      width: '0.8fr',
      align: 'right',
      render: (r) => (
        <button
          type="button"
          className={`btn ${r.activo ? 'btnDanger' : 'btnGhost'}`}
          style={{ padding: '6px 12px', fontSize: 12 }}
          onClick={() => cambiarEstado(r)}
          disabled={procesando === r.id}
        >
          {r.activo ? 'Desactivar' : 'Activar'}
        </button>
      ),
    },
  ];

  return (
    <section className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-heading)' }}>Convenios</div>
        <button type="button" className="btn btnPrimary" style={{ padding: '9px 16px', fontSize: 12.5 }} onClick={() => setModalAbierto(true)}>
          <span className="msr" style={{ fontSize: 16 }}>add</span> Agregar
        </button>
      </div>
      {error && (
        <div style={{ margin: '14px 24px 0 24px', background: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-border)', color: 'var(--color-danger-dark)', borderRadius: 9, padding: '10px 14px', fontSize: 13, fontWeight: 600 }}>
          {error}
        </div>
      )}
      <DataTable columns={columns} rows={rows} loading={loading} emptyMessage="Sin convenios registrados" itemLabel="convenios" />

      <CatalogoFormModal
        open={modalAbierto}
        titulo="Agregar Convenio"
        item={null}
        camposIniciales={() => ({ epsId: epsList[0]?.id ?? '', tipoContrato: 'evento' })}
        renderCampos={({ campos, setCampos }) => (
          <>
            <div>
              <div className="fieldLabel">EPS / Entidad <span className="required">*</span></div>
              <select className="select" value={campos.epsId} onChange={(e) => setCampos({ ...campos, epsId: e.target.value })} required>
                {epsList.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
              </select>
            </div>
            <div>
              <div className="fieldLabel">Tipo de Contrato <span className="required">*</span></div>
              <select className="select" value={campos.tipoContrato} onChange={(e) => setCampos({ ...campos, tipoContrato: e.target.value })}>
                <option value="evento">Evento</option>
                <option value="capitacion">Capitación</option>
                <option value="paquete">Paquete</option>
              </select>
            </div>
          </>
        )}
        payloadDeCampos={(campos) => campos}
        onGuardar={async (payload) => {
          await createConvenio(payload);
          refrescar();
        }}
        onClose={() => setModalAbierto(false)}
      />
    </section>
  );
}
