import { useState } from 'react';
import Modal from '../common/Modal';

const CONFIG = {
  anulada: { titulo: 'Anular Factura', boton: 'Anular Factura', requerido: true, placeholder: 'Indica por qué se anula esta factura…' },
  en_glosa: { titulo: 'Marcar en Glosa', boton: 'Marcar en Glosa', requerido: false, placeholder: 'Motivo de la glosa reportado por la EPS (opcional)…' },
};

export default function EstadoFacturaModal({ open, estadoDestino, loading, onConfirm, onCancel }) {
  const [motivo, setMotivo] = useState('');
  const cfg = CONFIG[estadoDestino] ?? CONFIG.anulada;
  const invalido = cfg.requerido && motivo.trim().length < 5;

  return (
    <Modal
      open={open}
      title={cfg.titulo}
      onClose={onCancel}
      footer={
        <>
          <button type="button" className="btn btnGhost" onClick={onCancel} disabled={loading}>Cancelar</button>
          <button type="button" className="btn btnDanger" onClick={() => onConfirm(motivo.trim())} disabled={loading || invalido}>
            {loading ? 'Procesando…' : cfg.boton}
          </button>
        </>
      }
    >
      <div className="fieldLabel">
        Motivo {cfg.requerido && <span className="required">*</span>}
      </div>
      <textarea
        className="input"
        style={{ resize: 'vertical', height: 80 }}
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
        placeholder={cfg.placeholder}
        autoFocus
      />
    </Modal>
  );
}
