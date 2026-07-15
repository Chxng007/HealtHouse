import styles from './UserFormTabs.module.css';

const TABS = ['Información General', 'Roles y Permisos', 'Sedes Asignadas', 'Auditoría'];

export default function UserFormTabs({ activeTab, onTabChange, onCancel, saving }) {
  return (
    <div className={styles.bar}>
      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`${styles.tab} ${tab === activeTab ? styles.tabActive : styles.tabInactive}`}
            onClick={() => onTabChange(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className={styles.actions}>
        <button type="button" className="btn btnGhost" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn btnPrimary" disabled={saving}>
          <span className="msr" style={{ fontSize: 18 }}>save</span>
          {saving ? 'Guardando...' : 'Guardar Usuario'}
        </button>
      </div>
    </div>
  );
}
