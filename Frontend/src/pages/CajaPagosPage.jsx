import { useCallback, useEffect, useMemo, useState } from 'react';
import RegistrarPagoModal from '../components/facturacion/RegistrarPagoModal';
import CierreCajaModal from '../components/facturacion/CierreCajaModal';
import { crearCierreCaja, getResumenCaja } from '../api/caja.api';
import { getSedes } from '../api/sedes.api';
import { METODOS_PAGO } from '../constants/facturacion';
import { formatFecha, formatMoneda } from '../utils/formato';
import styles from '../styles/facturacion/CajaPagosPage.module.css';

export default function CajaPagosPage() {
  const [sedes, setSedes] = useState([]);
  const [sedeId, setSedeId] = useState('');
  const [resumen, setResumen] = useState({ metodos: { efectivo: 0, tarjeta: 0, transferencia: 0 }, pagos: [] });
  const [error, setError] = useState(null);
  const [modalPago, setModalPago] = useState(false);
  const [modalCierre, setModalCierre] = useState(false);
  const [cerrando, setCerrando] = useState(false);
  const [cierreInfo, setCierreInfo] = useState(null);

  useEffect(() => {
    getSedes().then((res) => {
      setSedes(res);
      setSedeId((res.find((s) => s.esPrincipal) ?? res[0])?.id ?? '');
    }).catch(() => setSedes([]));
  }, []);

  const refrescar = useCallback(() => {
    if (!sedeId) return;
    getResumenCaja(sedeId).then(setResumen).catch((err) => setError(err.message));
  }, [sedeId]);

  useEffect(refrescar, [refrescar]);

  const totalRecaudadoHoy = useMemo(
    () => resumen.metodos.efectivo + resumen.metodos.tarjeta + resumen.metodos.transferencia,
    [resumen],
  );

  const cerrarCaja = async ({ baseInicial, egresos }) => {
    setCerrando(true);
    setError(null);
    try {
      const cierre = await crearCierreCaja({ sedeId, baseInicial, egresos });
      setCierreInfo(cierre);
      setModalCierre(false);
      refrescar();
    } catch (err) {
      setError(err.message);
    } finally {
      setCerrando(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <select className="select" value={sedeId} onChange={(e) => { setSedeId(e.target.value); setCierreInfo(null); }} style={{ maxWidth: 220 }}>
          {sedes.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
        </select>
        <div className={styles.espaciador} />
        <button type="button" className="btn btnDanger" onClick={() => setModalCierre(true)} disabled={!!cierreInfo}>
          <span className="msr" style={{ fontSize: 17 }}>lock</span> {cierreInfo ? 'Caja Cerrada' : 'Cerrar Caja'}
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}
      {cierreInfo && (
        <div className={styles.cierreBanner}>
          Caja cerrada correctamente. Total en caja: <strong>{formatMoneda(cierreInfo.totalCaja)}</strong>
        </div>
      )}

      <div className={styles.main}>
        <div className={styles.columnaPrincipal}>
          <div className={styles.metodosGrid}>
            {METODOS_PAGO.map((m) => (
              <div key={m.value} className="card" style={{ padding: '18px 20px' }}>
                <div className={styles.metodoHeader}>
                  <span className="msr" style={{ fontSize: 20, color: m.color }}>{m.icon}</span>
                  <span className={styles.metodoLabel}>{m.label}</span>
                </div>
                <div className={styles.metodoValor}>{formatMoneda(resumen.metodos[m.value])}</div>
              </div>
            ))}
          </div>

          <section className="card">
            <div className={styles.pagosHeader}>
              <div className={styles.pagosTitulo}>Pagos Registrados Hoy</div>
              <button type="button" className={styles.registrarBtn} onClick={() => setModalPago(true)}>
                <span className="msr" style={{ fontSize: 16 }}>add</span> Registrar Pago
              </button>
            </div>
            <div className={styles.tablaHeader}>
              <div>RECIBO</div><div>PACIENTE</div><div>FACTURA</div><div>MÉTODO</div><div>VALOR</div>
            </div>
            {resumen.pagos.length === 0 && <div className={styles.vacio}>Aún no hay pagos registrados hoy.</div>}
            {resumen.pagos.map((p) => (
              <div key={p.id} className={styles.tablaFila}>
                <div className={styles.recibo}>{p.reciboNumero}</div>
                <div className={styles.pacienteNombre}>{p.factura.paciente.nombres} {p.factura.paciente.apellidos}</div>
                <div>{p.factura.numero}</div>
                <div>{METODOS_PAGO.find((m) => m.value === p.metodo)?.label}</div>
                <div className={styles.valor}>{formatMoneda(p.valor)}</div>
              </div>
            ))}
          </section>
        </div>

        <section className={`card ${styles.cuadreCard}`}>
          <div className={styles.cuadreTitulo}>Cuadre de Caja</div>
          <div className={styles.cuadreFila}><span>Total Recaudado Hoy</span><strong>{formatMoneda(totalRecaudadoHoy)}</strong></div>
          <div className={styles.cuadreFilaFinal}><span>Fecha</span><strong>{formatFecha(new Date())}</strong></div>
        </section>
      </div>

      <RegistrarPagoModal
        open={modalPago}
        factura={null}
        onClose={() => setModalPago(false)}
        onRegistrado={() => {
          setModalPago(false);
          refrescar();
        }}
      />

      <CierreCajaModal
        open={modalCierre}
        totalRecaudadoHoy={totalRecaudadoHoy}
        loading={cerrando}
        onConfirm={cerrarCaja}
        onCancel={() => setModalCierre(false)}
      />
    </div>
  );
}
