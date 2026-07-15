import styles from './InfoAdicionalSection.module.css';

function formatFecha(iso) {
  if (!iso) return 'Nunca';
  return new Date(iso).toLocaleString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function InfoAdicionalSection({ usuario }) {
  return (
    <section className="card" style={{ padding: 22 }}>
      <div className={styles.header}>
        <span className="msr" style={{ fontSize: 20, color: 'var(--color-primary)' }}>person</span>
        <h2 className={styles.title}>Información Adicional</h2>
      </div>

      <div className={styles.rows}>
        <div className={styles.row}>
          <span className="msr msr-outline" style={{ fontSize: 17, color: 'var(--text-tertiary)' }}>schedule</span>
          <span className={styles.rowLabel}>Último Acceso</span>
          <span className={styles.rowValue}>{formatFecha(usuario.lastAccess)}</span>
        </div>
        <div className={styles.row}>
          <span className="msr msr-outline" style={{ fontSize: 17, color: 'var(--text-tertiary)' }}>history</span>
          <span className={styles.rowLabel}>Intentos Fallidos</span>
          <span className={styles.rowValue}>{usuario.failedAttempts ?? 0}</span>
        </div>
        <div className={styles.row}>
          <span className="msr msr-outline" style={{ fontSize: 17, color: 'var(--text-tertiary)' }}>account_circle</span>
          <span className={styles.rowLabel}>Estado de la Cuenta</span>
          <span className={`${styles.badge} ${usuario.activo ? '' : styles.badgeInactive}`}>
            {usuario.activo ? 'Activa' : 'Inactiva'}
          </span>
        </div>
        <div className={styles.row}>
          <span className="msr msr-outline" style={{ fontSize: 17, color: 'var(--text-tertiary)' }}>lock_reset</span>
          <span className={styles.rowLabel}>Debe Cambiar Contraseña</span>
          <span className={styles.rowValue}>{usuario.mustChangePassword ? 'Sí' : 'No'}</span>
        </div>
      </div>
    </section>
  );
}
