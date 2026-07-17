import SearchSelect from '../common/SearchSelect';
import { searchCups } from '../../api/cups.api';
import { PRIORIDADES_ORDEN } from '../../constants/formulasOrdenes';
import styles from '../../styles/formulas-ordenes/ItemsEditor.module.css';

export default function OrdenItemsEditor({ items, onChange }) {
  const agregar = (cups) => {
    if (items.some((it) => it.cupsId === cups.id)) return;
    onChange([...items, { cupsId: cups.id, cups, prioridad: 'rutinaria' }]);
  };
  const actualizarPrioridad = (i, prioridad) =>
    onChange(items.map((it, idx) => (idx === i ? { ...it, prioridad } : it)));
  const quitar = (i) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <div>
      <div className="fieldLabel">Exámenes / Imágenes (CUPS) <span className="required">*</span></div>
      <SearchSelect
        value={null}
        onChange={agregar}
        fetcher={searchCups}
        getLabel={(c) => `${c.codigo} - ${c.nombre}`}
        placeholder="Buscar código o nombre CUPS…"
        minChars={1}
      />
      {items.map((item, i) => (
        <div key={item.cupsId} className={styles.filaOrden}>
          <div className={styles.cupsCodigo}>{item.cups.codigo}</div>
          <div className={styles.cupsNombre}>{item.cups.nombre}</div>
          <select className="select" value={item.prioridad} onChange={(e) => actualizarPrioridad(i, e.target.value)}>
            {PRIORIDADES_ORDEN.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          <button type="button" className={styles.quitarBtn} onClick={() => quitar(i)} aria-label="Quitar">
            <span className="msr" style={{ fontSize: 16 }}>close</span>
          </button>
        </div>
      ))}
    </div>
  );
}
