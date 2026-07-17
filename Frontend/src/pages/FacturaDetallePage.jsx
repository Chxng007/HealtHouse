import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EstadoBadge from '../components/common/EstadoBadge';
import PrintLayout from '../components/common/PrintLayout';
import EstadoFacturaModal from '../components/facturacion/EstadoFacturaModal';
import RegistrarPagoModal from '../components/facturacion/RegistrarPagoModal';
import NotaFacturaModal from '../components/facturacion/NotaFacturaModal';
import { crearNotaFactura, emitirFactura, getFactura, setEstadoFactura } from '../api/facturacion.api';
import { estadoFactura, labelTipoContrato } from '../constants/facturacion';
import { formatDocumento, formatFecha, formatMoneda } from '../utils/formato';
import styles from '../styles/facturacion/FacturaDetallePage.module.css';

export default function FacturaDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [factura, setFactura] = useState(null);
  const [error, setError] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [confirmEmitir, setConfirmEmitir] = useState(false);
  const [modalEstado, setModalEstado] = useState(null);
  const [modalPago, setModalPago] = useState(false);
  const [modalNota, setModalNota] = useState(false);

  const cargar = useCallback(() => {
    getFactura(id).then(setFactura).catch((err) => setError(err.message));
  }, [id]);

  useEffect(cargar, [cargar]);

  if (error) return <div className={styles.error}>{error}</div>;
  if (!factura) return <div className={styles.cargando}>Cargando factura…</div>;

  const e = estadoFactura(factura.estado);
  const pagado = factura.pagos.reduce((acc, p) => acc + Number(p.valor), 0);

  const emitir = async () => {
    setProcesando(true);
    try {
      setFactura(await emitirFactura(id));
      setConfirmEmitir(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(false);
    }
  };

  const cambiarEstado = async (motivo) => {
    setProcesando(true);
    try {
      setFactura(await setEstadoFactura(id, modalEstado, motivo || undefined));
      setModalEstado(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(false);
    }
  };

  const crearNota = async (data) => {
    setProcesando(true);
    try {
      setFactura(await crearNotaFactura(id, data));
      setModalNota(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={`card ${styles.banda}`}>
        <button type="button" className={styles.volverBtn} onClick={() => navigate('/facturacion')} title="Volver">
          <span className="msr" style={{ fontSize: 20 }}>arrow_back</span>
        </button>
        <div className={styles.info}>
          <div className={styles.numero}>{factura.numero ?? 'Factura en Borrador'}</div>
          <div className={styles.sub}>
            {factura.paciente.nombres} {factura.paciente.apellidos} · {factura.paciente.tipoDocumento} {formatDocumento(factura.paciente.numeroDocumento)}
          </div>
        </div>
        <EstadoBadge variant={e.badge}>{e.label}</EstadoBadge>
        <div className={styles.acciones}>
          {factura.estado === 'borrador' && (
            <>
              <button type="button" className="btn btnDanger" onClick={() => setModalEstado('anulada')}>Anular</button>
              <button type="button" className="btn btnPrimary" onClick={() => setConfirmEmitir(true)}>
                <span className="msr" style={{ fontSize: 17 }}>print</span> Emitir Factura
              </button>
            </>
          )}
          {['emitida', 'en_glosa'].includes(factura.estado) && (
            <>
              <button type="button" className="btn btnGhost" onClick={() => setModalNota(true)}>Nota Crédito/Débito</button>
              {factura.estado === 'emitida' && (
                <button type="button" className="btn btnGhost" onClick={() => setModalEstado('en_glosa')}>Marcar en Glosa</button>
              )}
              <button type="button" className="btn btnDanger" onClick={() => setModalEstado('anulada')}>Anular</button>
              <button type="button" className="btn btnPrimary" onClick={() => setModalPago(true)}>
                <span className="msr" style={{ fontSize: 17 }}>payments</span> Registrar Pago
              </button>
            </>
          )}
          {factura.estado === 'pagada' && (
            <button type="button" className="btn btnGhost" onClick={() => setModalNota(true)}>Nota Crédito/Débito</button>
          )}
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.main}>
        <div className={styles.columnaPrincipal}>
          <section className={`card ${styles.seccion}`}>
            <h2 className="sectionTitleSm">Información General</h2>
            <div className={styles.gridInfo}>
              <div><div className={styles.campoLabel}>Sede</div><div>{factura.sede.nombre}</div></div>
              <div><div className={styles.campoLabel}>EPS / Convenio</div><div>{factura.convenio.eps.nombre} · {labelTipoContrato(factura.convenio.tipoContrato)}</div></div>
              <div><div className={styles.campoLabel}>Fecha</div><div>{formatFecha(factura.fecha)}</div></div>
              <div><div className={styles.campoLabel}>Estado DIAN (stub)</div><div>{factura.estadoDian}</div></div>
            </div>
            {factura.estado === 'anulada' && <div className={styles.bannerAnulada}>Anulada: {factura.anuladaMotivo}</div>}
            {factura.estado === 'en_glosa' && factura.glosaMotivo && <div className={styles.bannerGlosa}>Motivo de glosa: {factura.glosaMotivo}</div>}
          </section>

          <section className={`card ${styles.seccion}`}>
            <h2 className="sectionTitleSm">Servicios Facturados</h2>
            <div className={styles.tablaHeader}>
              <div>Servicio</div><div>Cant.</div><div>V. Unitario</div><div>V. Total</div>
            </div>
            {factura.items.map((item) => (
              <div key={item.id} className={styles.tablaFila}>
                <div>{item.servicio.nombre}</div>
                <div>{item.cantidad}</div>
                <div>{formatMoneda(item.valorUnitario)}</div>
                <div>{formatMoneda(item.valorTotal)}</div>
              </div>
            ))}
            <div className={styles.totales}>
              <div><span>Subtotal</span><strong>{formatMoneda(factura.subtotal)}</strong></div>
              <div><span>Copago del paciente</span><strong>{formatMoneda(factura.copago)}</strong></div>
              <div className={styles.totalFinal}><span>Total Factura</span><strong>{formatMoneda(factura.total)}</strong></div>
            </div>
          </section>

          {factura.notas.length > 0 && (
            <section className={`card ${styles.seccion}`}>
              <h2 className="sectionTitleSm">Notas Crédito / Débito</h2>
              {factura.notas.map((n) => (
                <div key={n.id} className={styles.notaFila}>
                  <strong>{n.tipo === 'credito' ? 'Crédito' : 'Débito'}</strong> — {formatMoneda(n.valor)} — {n.motivo}
                </div>
              ))}
            </section>
          )}

          <section className={`card ${styles.seccion}`}>
            <h2 className="sectionTitleSm">Pagos Registrados</h2>
            {factura.pagos.length === 0 && <div className={styles.vacio}>Sin pagos registrados.</div>}
            {factura.pagos.map((p) => (
              <div key={p.id} className={styles.notaFila}>
                <strong>{p.reciboNumero}</strong> — {formatMoneda(p.valor)} — {p.metodo} — {formatFecha(p.createdAt)}
              </div>
            ))}
            {factura.pagos.length > 0 && (
              <div className={styles.totales}>
                <div className={styles.totalFinal}><span>Saldo Pendiente</span><strong>{formatMoneda(Number(factura.total) - pagado)}</strong></div>
              </div>
            )}
          </section>
        </div>

        <section className={`card ${styles.previewCard}`}>
          <div className={styles.previewHeader}>
            <span className="msr" style={{ fontSize: 18, color: 'var(--color-primary)' }}>visibility</span>
            <div className={styles.previewTitulo}>Vista Previa Imprimible</div>
          </div>
          <PrintLayout
            titulo="Factura de Venta de Servicios de Salud"
            paciente={`${factura.paciente.nombres} ${factura.paciente.apellidos}`}
            documento={`${factura.paciente.tipoDocumento} ${formatDocumento(factura.paciente.numeroDocumento)}`}
            fecha={factura.fecha}
          >
            <div>{factura.numero ?? 'Borrador — sin numerar'}</div>
            {factura.items.map((item) => (
              <div key={item.id}>{item.servicio.nombre} x{item.cantidad} — {formatMoneda(item.valorTotal)}</div>
            ))}
            <div style={{ marginTop: 8, fontWeight: 700 }}>Total: {formatMoneda(factura.total)}</div>
          </PrintLayout>
          {factura.numero && (
            <button type="button" className={`btn btnGhost ${styles.imprimirBtn}`} onClick={() => window.print()}>
              <span className="msr" style={{ fontSize: 17 }}>print</span> Imprimir
            </button>
          )}
        </section>
      </div>

      <ConfirmDialog
        open={confirmEmitir}
        title="Emitir Factura"
        message="Al emitir se asignará un número de factura definitivo y la factura quedará lista para cobro. Esta acción no se puede deshacer."
        confirmLabel="Emitir Factura"
        loading={procesando}
        onConfirm={emitir}
        onCancel={() => setConfirmEmitir(false)}
      />

      <EstadoFacturaModal
        open={!!modalEstado}
        estadoDestino={modalEstado}
        loading={procesando}
        onConfirm={cambiarEstado}
        onCancel={() => setModalEstado(null)}
      />

      <RegistrarPagoModal
        open={modalPago}
        factura={factura}
        onClose={() => setModalPago(false)}
        onRegistrado={(actualizada) => {
          setFactura(actualizada);
          setModalPago(false);
        }}
      />

      <NotaFacturaModal
        open={modalNota}
        loading={procesando}
        onConfirm={crearNota}
        onCancel={() => setModalNota(false)}
      />
    </div>
  );
}
