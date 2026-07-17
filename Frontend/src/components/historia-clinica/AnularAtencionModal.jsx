import { useState } from 'react';
import Modal from '../common/Modal';

export default function AnularAtencionModal({ open, loading, onConfirm, onCancel }) {
  const [motivo, setMotivo] = useState('');

  const confirmar = () => {
    if (motivo.trim().length < 5) return;
    onConfirm(motivo.trim());
  };

  return (
    <Modal
      open={open}
      title="Anular Atención"
      onClose={onCancel}
      footer={
        <>
          <button type="button" className="btn btnGhost" onClick={onCancel} disabled={loading}>Cancelar</button>
          <button type="button" className="btn btnDanger" onClick={confirmar} disabled={loading || motivo.trim().length < 5}>
            {loading ? 'Anulando…' : 'Anular Atención'}
          </button>
        </>
      }
    >
      <p style={{ margin: '0 0 12px 0', fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        Este registro clínico no se elimina, queda marcado como anulado de forma permanente junto con el motivo (Res. 3100 de 2019).
      </p>
      <div className="fieldLabel">Motivo de la anulación <span className="required">*</span></div>
      <textarea
        className="input"
        style={{ resize: 'vertical', height: 80 }}
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
        placeholder="Indica por qué se anula esta atención…"
        autoFocus
      />
    </Modal>
  );
}
