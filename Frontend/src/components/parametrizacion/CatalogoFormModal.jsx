import { useEffect, useState } from 'react';
import Modal from '../common/Modal';

function mensajeError(err) {
  if (err.detalles) {
    const primero = Object.values(err.detalles).flat()[0];
    if (primero) return primero;
  }
  return err.message;
}

export default function CatalogoFormModal({ open, titulo, item, camposIniciales, renderCampos, payloadDeCampos, onGuardar, onClose }) {
  const [campos, setCampos] = useState(camposIniciales(null));
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (open) {
      setCampos(camposIniciales(item));
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, item]);

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      await onGuardar(payloadDeCampos(campos), item);
      onClose();
    } catch (err) {
      setError(mensajeError(err));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal open={open} title={titulo} onClose={onClose} width={480}>
      <form onSubmit={guardar} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {renderCampos({ campos, setCampos })}
        {error && (
          <div style={{ background: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-border)', color: 'var(--color-danger-dark)', borderRadius: 9, padding: '10px 14px', fontSize: 13, fontWeight: 600 }}>
            {error}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" className="btn btnGhost" onClick={onClose} disabled={guardando}>Cancelar</button>
          <button type="submit" className="btn btnPrimary" disabled={guardando}>
            {guardando ? 'Guardando…' : item ? 'Guardar Cambios' : 'Crear'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
