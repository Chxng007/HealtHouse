import { useState } from 'react';
import Modal from '../common/Modal';

export default function AnularDocumentoModal({ open, tipoLabel, loading, onConfirm, onCancel }) {
  const [motivo, setMotivo] = useState('');

  const confirmar = () => {
    if (motivo.trim().length < 5) return;
    onConfirm(motivo.trim());
    setMotivo('');
  };

  return (
    <Modal
      open={open}
      title={`Anular ${tipoLabel}`}
      onClose={onCancel}
      footer={
        <>
          <button type="button" className="btn btnGhost" onClick={onCancel} disabled={loading}>Cancelar</button>
          <button type="button" className="btn btnDanger" onClick={confirmar} disabled={loading || motivo.trim().length < 5}>
            {loading ? 'Anulando…' : `Anular ${tipoLabel}`}
          </button>
        </>
      }
    >
      <p style={{ margin: '0 0 12px 0', fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        Este documento no se elimina, queda marcado como anulado de forma permanente junto con el motivo.
      </p>
      <div className="fieldLabel">Motivo de la anulación <span className="required">*</span></div>
      <textarea
        className="input"
        style={{ resize: 'vertical', height: 80 }}
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
        placeholder="Indica por qué se anula este documento…"
        autoFocus
      />
    </Modal>
  );
}
