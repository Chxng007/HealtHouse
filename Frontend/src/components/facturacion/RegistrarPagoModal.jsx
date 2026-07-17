import { useEffect, useMemo, useState } from 'react';
import Modal from '../common/Modal';
import SearchSelect from '../common/SearchSelect';
import { listFacturas, registrarPago } from '../../api/facturacion.api';
import { METODOS_PAGO } from '../../constants/facturacion';
import { formatMoneda } from '../../utils/formato';
import styles from '../../styles/facturacion/RegistrarPagoModal.module.css';

export default function RegistrarPagoModal({ open, factura, onClose, onRegistrado }) {
  const [facturaSel, setFacturaSel] = useState(factura ?? null);
  const [metodo, setMetodo] = useState('efectivo');
  const [valor, setValor] = useState('');
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFacturaSel(factura ?? null);
    setMetodo('efectivo');
    setError(null);
    setValor('');
  }, [open, factura]);

  const restante = useMemo(() => {
    if (!facturaSel) return 0;
    const pagado = facturaSel.pagos?.reduce((acc, p) => acc + Number(p.valor), 0) ?? 0;
    return Number(facturaSel.total) - pagado;
  }, [facturaSel]);

  useEffect(() => {
    if (facturaSel) setValor(String(restante));
  }, [facturaSel, restante]);

  const buscarFacturas = async (query) => {
    const res = await listFacturas({ search: query, pageSize: 10 });
    return res.data.filter((f) => ['emitida', 'en_glosa'].includes(f.estado));
  };

  const guardar = async (e) => {
    e.preventDefault();
    if (!facturaSel) {
      setError('Selecciona la factura a pagar.');
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      const actualizada = await registrarPago(facturaSel.id, { metodo, valor: Number(valor) });
      onRegistrado(actualizada);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal open={open} title="Registrar Pago" onClose={onClose} width={480}>
      <form onSubmit={guardar} className={styles.form}>
        {!factura && (
          <div>
            <div className="fieldLabel">Factura <span className="required">*</span></div>
            <SearchSelect
              value={facturaSel}
              onChange={setFacturaSel}
              fetcher={buscarFacturas}
              getLabel={(f) => `${f.numero} · ${f.paciente.nombres} ${f.paciente.apellidos}`}
              getSublabel={(f) => `${formatMoneda(f.total)} · ${f.convenio.eps.nombre}`}
              placeholder="Buscar por número o paciente…"
            />
          </div>
        )}

        {facturaSel && (
          <div className={styles.resumenFactura}>
            <div><strong>{facturaSel.numero}</strong> — {facturaSel.paciente.nombres} {facturaSel.paciente.apellidos}</div>
            <div>Total: {formatMoneda(facturaSel.total)} · Saldo pendiente: <strong>{formatMoneda(restante)}</strong></div>
          </div>
        )}

        <div className={styles.grid2}>
          <div>
            <div className="fieldLabel">Método de Pago <span className="required">*</span></div>
            <select className="select" value={metodo} onChange={(e) => setMetodo(e.target.value)}>
              {METODOS_PAGO.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <div className="fieldLabel">Valor <span className="required">*</span></div>
            <input className="input" type="number" min={1} step="1" value={valor} onChange={(e) => setValor(e.target.value)} required />
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.footer}>
          <button type="button" className="btn btnGhost" onClick={onClose} disabled={guardando}>Cancelar</button>
          <button type="submit" className="btn btnPrimary" disabled={guardando || !facturaSel}>
            <span className="msr" style={{ fontSize: 17 }}>payments</span>
            {guardando ? 'Registrando…' : 'Registrar Pago'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
