import styles from '../../styles/users/AsignacionRolSection.module.css';

export default function AsignacionRolSection({ roles, rolId, onSelect }) {
  return (
    <section className="card" style={{ padding: '22px 22px 24px 22px' }}>
      <div className={`sectionHeader ${styles.headerRow}`}>
        <div className="sectionIconBadge">
          <span className="msr" style={{ fontSize: 20, color: 'var(--color-primary)' }}>manage_accounts</span>
        </div>
        <div>
          <h2 className="sectionTitleSm">Asignación de Rol</h2>
          <div className="sectionSubtitle">Seleccione el rol principal del usuario</div>
        </div>
      </div>

      <div className={styles.grid}>
        {roles.map((rol) => {
          const selected = rol.id === rolId;
          return (
            <button
              type="button"
              key={rol.id}
              className={styles.card}
              onClick={() => onSelect(rol.id)}
              style={{
                border: selected ? '2px solid var(--color-success)' : '1px solid var(--border-default)',
                background: selected ? '#f0fdf4' : '#fff',
              }}
            >
              {selected && (
                <span className={styles.checkBadge}>
                  <span className="msr" style={{ fontSize: 13, color: '#fff' }}>check</span>
                </span>
              )}
              <span className={styles.iconCircle} style={{ background: rol.color }}>
                <span className="msr" style={{ fontSize: 19, color: '#fff' }}>{rol.icono}</span>
              </span>
              <span className={styles.label}>{rol.nombre}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
