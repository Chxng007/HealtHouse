import { useLocation } from 'react-router-dom';
import { getBreadcrumb } from './pageHeader';
import styles from '../../styles/layout/Topbar.module.css';

export default function Topbar() {
  const location = useLocation();
  const { module, page } = getBreadcrumb(location.pathname);

  return (
    <header className={styles.header}>
      <span className={`msr ${styles.menuIcon}`}>menu</span>

      <div className={styles.breadcrumb}>
        <span className={styles.breadcrumbModule}>{module}</span>
        {page && (
          <>
            <span className={`msr ${styles.breadcrumbChevron}`}>chevron_right</span>
            <span className={styles.breadcrumbPage}>{page}</span>
          </>
        )}
      </div>

      <div className={styles.spacer} />

      <div className={styles.search}>
        <span className={`msr ${styles.searchIcon}`}>search</span>
        <input
          type="text"
          placeholder="Buscar pacientes, citas, historias..."
          className={styles.searchInput}
        />
      </div>

      <div className={styles.iconButton}>
        <span className="msr msr-outline" style={{ fontSize: 23 }}>notifications</span>
        <span className={styles.notifBadge}>5</span>
      </div>

      <span className={`msr msr-outline ${styles.iconButton}`} style={{ fontSize: 23 }}>help</span>

      <div className={styles.orgSection}>
        <span className={`msr ${styles.orgIcon}`}>apartment</span>
        <div className={styles.orgText}>
          <div className={styles.orgName}>IPS Health House</div>
          <div className={styles.orgSede}>
            Sede Principal <span className="msr" style={{ fontSize: 14 }}>expand_more</span>
          </div>
        </div>
        <div className={styles.userAvatarWrap}>
          <img src="https://i.pravatar.cc/96?img=12" alt="Usuario" className={styles.userAvatarImg} />
          <span className={styles.userAvatarDot} />
        </div>
        <span className={`msr ${styles.chevronMuted}`}>expand_more</span>
      </div>
    </header>
  );
}
