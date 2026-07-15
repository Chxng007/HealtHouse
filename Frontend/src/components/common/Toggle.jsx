import styles from '../../styles/common/Toggle.module.css';

export default function Toggle({ checked, onChange, activeLabel = 'Activo', inactiveLabel = 'Inactivo' }) {
  return (
    <button type="button" className={styles.wrapper} onClick={() => onChange(!checked)}>
      <span
        className={styles.track}
        style={{ background: checked ? 'var(--color-success)' : '#cbd5e1' }}
      >
        <span className={styles.knob} style={{ left: checked ? '27px' : '3px' }} />
      </span>
      <span
        className={styles.label}
        style={{ color: checked ? 'var(--color-success-dark)' : 'var(--text-tertiary)' }}
      >
        {checked ? activeLabel : inactiveLabel}
      </span>
    </button>
  );
}
