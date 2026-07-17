import { useEffect, useState } from 'react';
import { getServicios, getTarifasConvenio, upsertTarifa } from '../../api/catalogosFacturacion.api';
import { labelConvenio } from '../../constants/facturacion';
import { formatMoneda } from '../../utils/formato';

export default function TarifasTab({ convenios }) {
  const [convenioId, setConvenioId] = useState(convenios[0]?.id ?? '');
  const [servicios, setServicios] = useState([]);
  const [tarifas, setTarifas] = useState([]);
  const [editando, setEditando] = useState(null);
  const [valorEdit, setValorEdit] = useState('');
  const [copagoEdit, setCopagoEdit] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getServicios({ todas: true }).then(setServicios).catch(() => setServicios([]));
  }, []);

  const refrescarTarifas = () => {
    if (!convenioId) return;
    getTarifasConvenio(convenioId).then(setTarifas).catch((err) => setError(err.message));
  };
  useEffect(refrescarTarifas, [convenioId]);

  const tarifaDe = (servicioId) => tarifas.find((t) => t.servicioId === servicioId);

  const editar = (servicio) => {
    const tarifa = tarifaDe(servicio.id);
    setEditando(servicio.id);
    setValorEdit(tarifa ? String(tarifa.valor) : String(servicio.valorBase));
    setCopagoEdit(tarifa ? String(tarifa.copago) : '0');
  };

  const guardar = async (servicioId) => {
    setGuardando(true);
    setError(null);
    try {
      await upsertTarifa({ convenioId, servicioId, valor: Number(valorEdit), copago: Number(copagoEdit) });
      setEditando(null);
      refrescarTarifas();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-heading)' }}>Tarifas</div>
        <div style={{ flex: 1 }} />
        <select className="select" style={{ width: 260 }} value={convenioId} onChange={(e) => setConvenioId(e.target.value)}>
          {convenios.map((c) => <option key={c.id} value={c.id}>{labelConvenio(c)}</option>)}
        </select>
      </div>

      {error && (
        <div style={{ margin: '14px 24px 0 24px', background: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-border)', color: 'var(--color-danger-dark)', borderRadius: 9, padding: '10px 14px', fontSize: 13, fontWeight: 600 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1fr', padding: '10px 24px', background: 'var(--color-bg-subtle)', fontWeight: 800, fontSize: 12, color: 'var(--text-tertiary)' }}>
        <div>SERVICIO</div><div>VALOR</div><div>COPAGO</div><div></div>
      </div>
      {servicios.map((s) => {
        const tarifa = tarifaDe(s.id);
        const enEdicion = editando === s.id;
        return (
          <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1fr', padding: '10px 24px', borderTop: '1px solid var(--border-subtle)', fontSize: 13.5, alignItems: 'center' }}>
            <div>{s.nombre}</div>
            {enEdicion ? (
              <>
                <input className="input" type="number" min={0} value={valorEdit} onChange={(e) => setValorEdit(e.target.value)} />
                <input className="input" type="number" min={0} value={copagoEdit} onChange={(e) => setCopagoEdit(e.target.value)} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" className="btn btnGhost" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => setEditando(null)} disabled={guardando}>Cancelar</button>
                  <button type="button" className="btn btnPrimary" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => guardar(s.id)} disabled={guardando}>Guardar</button>
                </div>
              </>
            ) : (
              <>
                <div>{tarifa ? formatMoneda(tarifa.valor) : <span style={{ color: 'var(--text-placeholder)' }}>Sin definir</span>}</div>
                <div>{tarifa ? formatMoneda(tarifa.copago) : '—'}</div>
                <div><button type="button" className="btn btnGhost" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => editar(s)}>Editar</button></div>
              </>
            )}
          </div>
        );
      })}
    </section>
  );
}
