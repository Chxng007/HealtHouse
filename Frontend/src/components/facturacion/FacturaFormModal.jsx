import { useEffect, useMemo, useState } from 'react';
import Modal from '../common/Modal';
import SearchSelect from '../common/SearchSelect';
import { createFactura } from '../../api/facturacion.api';
import { getTarifasConvenio } from '../../api/catalogosFacturacion.api';
import { listPacientes } from '../../api/pacientes.api';
import { labelConvenio } from '../../constants/facturacion';
import { formatDocumento, formatMoneda } from '../../utils/formato';
import styles from '../../styles/facturacion/FacturaFormModal.module.css';

export default function FacturaFormModal({ open, sedes, convenios, servicios, onClose, onCreada }) {
  const [paciente, setPaciente] = useState(null);
  const [sedeId, setSedeId] = useState('');
  const [convenioId, setConvenioId] = useState('');
  const [tarifas, setTarifas] = useState([]);
  const [servicioParaAgregar, setServicioParaAgregar] = useState('');
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!open) return;
    setPaciente(null);
    setItems([]);
    setError(null);
    setConvenioId('');
    setTarifas([]);
    const principal = sedes.find((s) => s.esPrincipal) ?? sedes[0];
    setSedeId(principal?.id ?? '');
  }, [open, sedes]);

  const conveniosSugeridos = useMemo(() => {
    if (!paciente) return convenios;
    const delPaciente = convenios.filter((c) => c.eps.id === paciente.epsId);
    return delPaciente.length > 0 ? delPaciente : convenios;
  }, [convenios, paciente]);

  useEffect(() => {
    if (!convenioId) {
      setTarifas([]);
      return;
    }
    getTarifasConvenio(convenioId).then(setTarifas).catch(() => setTarifas([]));
  }, [convenioId]);

  const tarifaDe = (servicioId) => tarifas.find((t) => t.servicioId === servicioId);

  const buscarPacientes = useMemo(
    () => async (query) => {
      const esDocumento = /^\d+$/.test(query);
      const res = await listPacientes(esDocumento ? { documento: query, pageSize: 8 } : { search: query, pageSize: 8 });
      return res.data;
    },
    [],
  );

  const agregarItem = () => {
    if (!servicioParaAgregar || items.some((i) => i.servicioId === servicioParaAgregar)) return;
    setItems((prev) => [...prev, { servicioId: servicioParaAgregar, cantidad: 1 }]);
    setServicioParaAgregar('');
  };
  const actualizarCantidad = (servicioId, cantidad) =>
    setItems((prev) => prev.map((i) => (i.servicioId === servicioId ? { ...i, cantidad } : i)));
  const quitarItem = (servicioId) => setItems((prev) => prev.filter((i) => i.servicioId !== servicioId));

  const subtotal = items.reduce((acc, item) => {
    const tarifa = tarifaDe(item.servicioId);
    return acc + (tarifa ? Number(tarifa.valor) * item.cantidad : 0);
  }, 0);

  const guardar = async (e) => {
    e.preventDefault();
    if (!paciente || items.length === 0) {
      setError('Selecciona un paciente y agrega al menos un servicio.');
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      const factura = await createFactura({ pacienteId: paciente.id, convenioId, sedeId, items });
      onCreada(factura);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal open={open} title="Generar Factura" onClose={onClose} width={620}>
      <form onSubmit={guardar} className={styles.form}>
        <div>
          <div className="fieldLabel">Paciente <span className="required">*</span></div>
          <SearchSelect
            value={paciente}
            onChange={setPaciente}
            fetcher={buscarPacientes}
            getLabel={(p) => `${p.nombres} ${p.apellidos}`}
            getSublabel={(p) => `${p.tipoDocumento} ${formatDocumento(p.numeroDocumento)} · ${p.eps?.nombre ?? ''}`}
            placeholder="Nombre, apellido o documento…"
          />
        </div>

        <div className={styles.grid2}>
          <div>
            <div className="fieldLabel">Sede <span className="required">*</span></div>
            <select className="select" value={sedeId} onChange={(e) => setSedeId(e.target.value)} required>
              {sedes.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
          </div>
          <div>
            <div className="fieldLabel">EPS / Convenio <span className="required">*</span></div>
            <select className="select" value={convenioId} onChange={(e) => setConvenioId(e.target.value)} required>
              <option value="">Seleccionar…</option>
              {conveniosSugeridos.map((c) => <option key={c.id} value={c.id}>{labelConvenio(c)}</option>)}
            </select>
          </div>
        </div>

        <div>
          <div className="fieldLabel">Agregar Servicio</div>
          <div className={styles.agregarFila}>
            <select className="select" value={servicioParaAgregar} onChange={(e) => setServicioParaAgregar(e.target.value)} disabled={!convenioId}>
              <option value="">Seleccionar servicio…</option>
              {servicios.filter((s) => !items.some((i) => i.servicioId === s.id)).map((s) => (
                <option key={s.id} value={s.id}>{s.codigo} - {s.nombre}</option>
              ))}
            </select>
            <button type="button" className="btn btnGhost" onClick={agregarItem} disabled={!servicioParaAgregar} aria-label="Agregar servicio">
              <span className="msr" style={{ fontSize: 17 }}>add</span>
            </button>
          </div>
        </div>

        {items.length > 0 && (
          <div className={styles.itemsTabla}>
            {items.map((item) => {
              const servicio = servicios.find((s) => s.id === item.servicioId);
              const tarifa = tarifaDe(item.servicioId);
              return (
                <div key={item.servicioId} className={styles.itemFila}>
                  <div className={styles.itemNombre}>{servicio?.nombre}</div>
                  <input
                    className="input"
                    type="number"
                    min={1}
                    max={99}
                    value={item.cantidad}
                    onChange={(e) => actualizarCantidad(item.servicioId, Number(e.target.value))}
                  />
                  <div className={styles.itemValor}>{tarifa ? formatMoneda(Number(tarifa.valor) * item.cantidad) : '—'}</div>
                  <button type="button" className={styles.quitarBtn} onClick={() => quitarItem(item.servicioId)}>
                    <span className="msr" style={{ fontSize: 16 }}>close</span>
                  </button>
                </div>
              );
            })}
            <div className={styles.subtotalFila}>
              <span>Subtotal</span>
              <strong>{formatMoneda(subtotal)}</strong>
            </div>
          </div>
        )}

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.footer}>
          <button type="button" className="btn btnGhost" onClick={onClose} disabled={guardando}>Cancelar</button>
          <button type="submit" className="btn btnPrimary" disabled={guardando}>
            <span className="msr" style={{ fontSize: 18 }}>add</span>
            {guardando ? 'Creando…' : 'Crear Factura (Borrador)'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
