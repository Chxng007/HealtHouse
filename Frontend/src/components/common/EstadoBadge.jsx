import styles from '../../styles/common/EstadoBadge.module.css';

const VARIANTES = {
  success: styles.success,
  warning: styles.warning,
  neutral: styles.neutral,
  danger: styles.danger,
  primary: styles.primary,
};

export default function EstadoBadge({ children, variant = 'neutral' }) {
  return <span className={`${styles.badge} ${VARIANTES[variant] ?? styles.neutral}`}>{children}</span>;
}
