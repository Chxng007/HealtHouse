import { useState } from 'react';
import Modal from '../common/Modal';
import { formatMoneda } from '../../utils/formato';

export default function CierreCajaModal({ open, totalRecaudadoHoy, loading, onConfirm, onCancel }) {
  const [baseInicial, setBaseInicial] = useState('200000');
  const [egresos, setEgresos] = useState('0');

  const totalCaja = Number(baseInicial || 0) + totalRecaudadoHoy - Number(egresos || 0);

  const confirmar = () => {
    onConfirm({ baseInicial: Number(baseInicial), egresos: Number(egresos) });
  };

  return (
    <Modal
      open={open}
      title="Cerrar Caja"
      onClose={onCancel}
      footer={
        <>
          <button type="button" className="btn btnGhost" onClick={onCancel} disabled={loading}>Cancelar</button>
          <button type="button" className="btn btnDanger" onClick={confirmar} disabled={loading}>
            {loading ? 'Cerrando…' : 'Cerrar Caja'}
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
          Se cerrarán los pagos registrados hoy en esta sede y no podrán volver a incluirse en otro cierre.
        </p>
        <div>
          <div className="fieldLabel">Base Inicial</div>
          <input className="input" type="number" min={0} value={baseInicial} onChange={(e) => setBaseInicial(e.target.value)} />
        </div>
        <div>
          <div className="fieldLabel">Egresos / Devoluciones</div>
          <input className="input" type="number" min={0} value={egresos} onChange={(e) => setEgresos(e.target.value)} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, background: 'var(--color-bg-subtle)', borderRadius: 9, padding: '10px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Total Recaudado Hoy</span><strong>{formatMoneda(totalRecaudadoHoy)}</strong></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 6, borderTop: '1px solid var(--border-subtle)' }}>
            <span style={{ fontWeight: 800 }}>Total en Caja</span><strong style={{ color: 'var(--color-success-dark)' }}>{formatMoneda(totalCaja)}</strong>
          </div>
        </div>
      </div>
    </Modal>
  );
}
