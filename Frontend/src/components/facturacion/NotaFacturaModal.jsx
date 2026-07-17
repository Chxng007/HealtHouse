import { useState } from 'react';
import Modal from '../common/Modal';

export default function NotaFacturaModal({ open, loading, onConfirm, onCancel }) {
  const [tipo, setTipo] = useState('credito');
  const [valor, setValor] = useState('');
  const [motivo, setMotivo] = useState('');

  const invalido = !valor || Number(valor) <= 0 || motivo.trim().length < 5;

  const confirmar = () => {
    if (invalido) return;
    onConfirm({ tipo, valor: Number(valor), motivo: motivo.trim() });
  };

  return (
    <Modal
      open={open}
      title="Nueva Nota Crédito / Débito"
      onClose={onCancel}
      footer={
        <>
          <button type="button" className="btn btnGhost" onClick={onCancel} disabled={loading}>Cancelar</button>
          <button type="button" className="btn btnPrimary" onClick={confirmar} disabled={loading || invalido}>
            {loading ? 'Creando…' : 'Crear Nota'}
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <div className="fieldLabel">Tipo de Nota</div>
          <select className="select" value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="credito">Nota Crédito (a favor del paciente/EPS)</option>
            <option value="debito">Nota Débito (cargo adicional)</option>
          </select>
        </div>
        <div>
          <div className="fieldLabel">Valor <span className="required">*</span></div>
          <input className="input" type="number" min={1} value={valor} onChange={(e) => setValor(e.target.value)} required />
        </div>
        <div>
          <div className="fieldLabel">Motivo <span className="required">*</span></div>
          <textarea
            className="input"
            style={{ resize: 'vertical', height: 70 }}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Motivo del ajuste…"
          />
        </div>
      </div>
    </Modal>
  );
}
