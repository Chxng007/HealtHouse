import styles from '../../styles/formulas-ordenes/ItemsEditor.module.css';

const ITEM_VACIO = { medicamento: '', dosis: '', frecuencia: '', duracion: '' };

export { ITEM_VACIO as MEDICAMENTO_VACIO };

export default function MedicamentosEditor({ items, onChange }) {
  const actualizar = (i, campo, valor) =>
    onChange(items.map((it, idx) => (idx === i ? { ...it, [campo]: valor } : it)));
  const agregar = () => onChange([...items, { ...ITEM_VACIO }]);
  const quitar = (i) => onChange(items.length > 1 ? items.filter((_, idx) => idx !== i) : items);

  return (
    <div>
      <div className={styles.header}>
        <div className="fieldLabel">Medicamentos <span className="required">*</span></div>
        <button type="button" className={styles.agregarBtn} onClick={agregar}>
          <span className="msr" style={{ fontSize: 16 }}>add</span> Agregar Ítem
        </button>
      </div>
      {items.map((item, i) => (
        <div key={i} className={styles.filaMedicamento}>
          <input
            className="input"
            placeholder="Medicamento (ej. Sertralina 50mg)"
            value={item.medicamento}
            onChange={(e) => actualizar(i, 'medicamento', e.target.value)}
            required
          />
          <input className="input" placeholder="Dosis" value={item.dosis} onChange={(e) => actualizar(i, 'dosis', e.target.value)} required />
          <input className="input" placeholder="Frecuencia" value={item.frecuencia} onChange={(e) => actualizar(i, 'frecuencia', e.target.value)} required />
          <input className="input" placeholder="Duración" value={item.duracion} onChange={(e) => actualizar(i, 'duracion', e.target.value)} required />
          <button type="button" className={styles.quitarBtn} onClick={() => quitar(i)} disabled={items.length === 1} aria-label="Quitar">
            <span className="msr" style={{ fontSize: 16 }}>close</span>
          </button>
        </div>
      ))}
    </div>
  );
}
