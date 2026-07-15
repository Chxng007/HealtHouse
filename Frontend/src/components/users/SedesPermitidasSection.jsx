import styles from '../../styles/users/SedesPermitidasSection.module.css';

export default function SedesPermitidasSection({ sedes, sedeIds, onToggle }) {
  return (
    <section className="card" style={{ padding: '22px 22px 18px 22px' }}>
      <div className={`sectionHeader ${styles.headerRow}`}>
        <div className="sectionIconBadge">
          <span className="msr" style={{ fontSize: 20, color: 'var(--color-primary)' }}>apartment</span>
        </div>
        <div>
          <h2 className="sectionTitleSm">Sedes Permitidas</h2>
          <div className="sectionSubtitle">Seleccione las sedes a las que tendrá acceso</div>
        </div>
      </div>

      <div className={styles.list}>
        {sedes.map((sede) => {
          const checked = sedeIds.includes(sede.id);
          return (
            <label key={sede.id} className={styles.row}>
              <input type="checkbox" checked={checked} onChange={() => onToggle(sede.id)} />
              <span className={styles.label}>
                {sede.nombre} ({sede.ciudad})
              </span>
              {sede.esPrincipal && <span className={styles.badgePrincipal}>Principal</span>}
            </label>
          );
        })}
      </div>
    </section>
  );
}
