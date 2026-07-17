import { useRef, useState } from 'react';
import styles from '../../styles/formulas-ordenes/SignaturePad.module.css';

function posicionDe(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  const punto = e.touches ? e.touches[0] : e;
  return { x: punto.clientX - rect.left, y: punto.clientY - rect.top };
}

export default function SignaturePad({ onGuardar, guardando }) {
  const canvasRef = useRef(null);
  const dibujando = useRef(false);
  const [vacio, setVacio] = useState(true);

  const iniciar = (e) => {
    dibujando.current = true;
    const { x, y } = posicionDe(e, canvasRef.current);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const mover = (e) => {
    if (!dibujando.current) return;
    e.preventDefault();
    const { x, y } = posicionDe(e, canvasRef.current);
    const ctx = canvasRef.current.getContext('2d');
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
    setVacio(false);
  };

  const terminar = () => {
    dibujando.current = false;
  };

  const limpiar = () => {
    const canvas = canvasRef.current;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    setVacio(true);
  };

  const guardar = () => {
    canvasRef.current.toBlob((blob) => onGuardar(blob), 'image/png');
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={420}
        height={150}
        className={styles.canvas}
        onMouseDown={iniciar}
        onMouseMove={mover}
        onMouseUp={terminar}
        onMouseLeave={terminar}
        onTouchStart={iniciar}
        onTouchMove={mover}
        onTouchEnd={terminar}
      />
      <div className={styles.acciones}>
        <button type="button" className="btn btnGhost" onClick={limpiar} disabled={guardando}>Limpiar</button>
        <button type="button" className="btn btnPrimary" onClick={guardar} disabled={vacio || guardando}>
          <span className="msr" style={{ fontSize: 17 }}>draw</span>
          {guardando ? 'Guardando…' : 'Guardar Firma'}
        </button>
      </div>
    </div>
  );
}
