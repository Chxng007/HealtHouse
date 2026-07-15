import { useLocation } from 'react-router-dom';
import { getBreadcrumb } from '../components/layout/pageHeader';
import styles from './ComingSoonPage.module.css';

export default function ComingSoonPage() {
  const location = useLocation();
  const { module } = getBreadcrumb(location.pathname);

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.iconBadge}>
          <span className="msr" style={{ fontSize: 28, color: 'var(--color-primary)' }}>construction</span>
        </div>
        <h2 className={styles.title}>{module}</h2>
        <p className={styles.subtitle}>
          Este módulo está en construcción. Estará disponible en una próxima iteración de HealthCore.
        </p>
      </div>
    </div>
  );
}
