import styles from '../../styles/users/UserFormFooter.module.css';

export default function UserFormFooter({ isEditMode, activo, onDesactivar, onLimpiar, saving }) {
  return (
    <div className={styles.footer}>
      <div className={styles.infoBox}>
        <span className="msr" style={{ fontSize: 20, color: 'var(--color-primary)', marginTop: 1 }}>info</span>
        <div>
          <div className={styles.infoTitle}>Importante</div>
          <div className={styles.infoText}>
            Los permisos se heredan del rol seleccionado, pero pueden ajustarse de forma personalizada.
          </div>
        </div>
      </div>
      <div className={styles.actions}>
        {isEditMode && (
          <button type="button" className="btn btnDanger" onClick={onDesactivar}>
            <span className="msr msr-outline" style={{ fontSize: 17 }}>delete</span>
            {activo ? 'Desactivar Usuario' : 'Activar Usuario'}
          </button>
        )}
        <button type="button" className="btn btnGhost" onClick={onLimpiar}>
          Limpiar
        </button>
        <button type="submit" className="btn btnPrimary" disabled={saving}>
          <span className="msr" style={{ fontSize: 18 }}>save</span>
          {saving ? 'Guardando...' : 'Guardar Usuario'}
        </button>
      </div>
    </div>
  );
}
