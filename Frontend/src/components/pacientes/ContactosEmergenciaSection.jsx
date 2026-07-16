import { PARENTESCOS } from '../../constants/pacientes';
import styles from '../../styles/pacientes/ContactosEmergenciaSection.module.css';

const CONTACTO_VACIO = { nombre: '', parentesco: '', telefono: '', direccion: '' };

export default function ContactosEmergenciaSection({ contactos, onChange }) {
  const actualizar = (index, campo, valor) => {
    onChange(contactos.map((c, i) => (i === index ? { ...c, [campo]: valor } : c)));
  };

  const eliminar = (index) => onChange(contactos.filter((_, i) => i !== index));

  return (
    <section className={`card ${styles.card}`}>
      <div className="sectionHeader">
        <div className="sectionIconBadge">
          <span className="msr" style={{ fontSize: 20, color: 'var(--color-primary)' }}>emergency</span>
        </div>
        <div>
          <h2 className="sectionTitleSm">Contactos de Emergencia</h2>
          <div className="sectionSubtitle">Personas a contactar en caso de emergencia (RF-PAC-04)</div>
        </div>
      </div>

      {contactos.length === 0 && (
        <div className={styles.vacio}>No hay contactos de emergencia registrados.</div>
      )}

      {contactos.map((contacto, index) => (
        <div key={index} className={styles.fila}>
          <div>
            <div className="fieldLabel">Nombre <span className="required">*</span></div>
            <input
              className="input"
              value={contacto.nombre}
              onChange={(e) => actualizar(index, 'nombre', e.target.value)}
              placeholder="Nombre completo"
            />
          </div>
          <div>
            <div className="fieldLabel">Parentesco <span className="required">*</span></div>
            <select
              className="select"
              value={contacto.parentesco}
              onChange={(e) => actualizar(index, 'parentesco', e.target.value)}
            >
              <option value="">Seleccionar…</option>
              {PARENTESCOS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <div className="fieldLabel">Teléfono <span className="required">*</span></div>
            <input
              className="input"
              value={contacto.telefono}
              onChange={(e) => actualizar(index, 'telefono', e.target.value)}
              placeholder="300 000 0000"
            />
          </div>
          <div>
            <div className="fieldLabel">Dirección</div>
            <input
              className="input"
              value={contacto.direccion ?? ''}
              onChange={(e) => actualizar(index, 'direccion', e.target.value)}
              placeholder="Dirección (opcional)"
            />
          </div>
          <button
            type="button"
            className={styles.eliminarBtn}
            onClick={() => eliminar(index)}
            title="Eliminar contacto"
          >
            <span className="msr" style={{ fontSize: 18 }}>delete</span>
          </button>
        </div>
      ))}

      <button type="button" className="btn btnGhost" onClick={() => onChange([...contactos, { ...CONTACTO_VACIO }])}>
        <span className="msr" style={{ fontSize: 18 }}>add</span> Agregar Contacto
      </button>
    </section>
  );
}
