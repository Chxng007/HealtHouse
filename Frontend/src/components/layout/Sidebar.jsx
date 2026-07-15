import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { sidebarItems } from './sidebarConfig';
import styles from '../../styles/layout/Sidebar.module.css';

function isChildActive(item, pathname) {
  return item.children?.some((child) => pathname.startsWith(child.path)) ?? false;
}

export default function Sidebar() {
  const location = useLocation();
  const [openLabel, setOpenLabel] = useState(
    () => sidebarItems.find((item) => item.children && isChildActive(item, location.pathname))?.label ?? null,
  );

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <span className="msr" style={{ fontSize: 28, color: '#fff' }}>home_health</span>
        </div>
        <div>
          <div className={styles.logoTitle}>
            <span>Health</span>
            <span className={styles.logoTitleGreen}>Core</span>
          </div>
          <div className={styles.logoSubtitle}>Plataforma IPS</div>
        </div>
      </div>

      <div className={styles.profile}>
        <div className={styles.avatarWrap}>
          <img
            src="https://i.pravatar.cc/96?img=12"
            alt="Administrador"
            className={styles.avatarImg}
          />
          <span className={styles.avatarBadge}>
            <span className="msr" style={{ fontSize: 9, color: '#fff' }}>verified</span>
          </span>
        </div>
        <div className={styles.profileInfo}>
          <div className={styles.profileName}>Administrador</div>
          <div className={styles.profileRole}>Administrador del Sistema</div>
          <div className={styles.profileStatus}>
            <span className={styles.statusDot} />
            <span className={styles.statusText}>En línea</span>
          </div>
        </div>
      </div>

      <nav className={styles.nav}>
        {sidebarItems.map((item) => {
          if (item.children) {
            const childActive = isChildActive(item, location.pathname);
            const isOpen = openLabel === item.label;
            return (
              <div key={item.label}>
                <button
                  type="button"
                  className={`${styles.navItem} ${childActive ? styles.navItemActive : ''}`}
                  onClick={() => setOpenLabel(isOpen ? null : item.label)}
                >
                  <span className={`msr ${styles.navIcon}`}>{item.icon}</span>
                  <span className={styles.navLabel}>{item.label}</span>
                  <span className={`msr ${styles.navChevron}`}>
                    {isOpen ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                {isOpen && (
                  <div className={styles.navChildren}>
                    {item.children.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        className={({ isActive }) =>
                          `${styles.navChild} ${isActive ? styles.navChildActive : ''}`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <span
                              className={`${styles.navChildDot} ${isActive ? styles.navChildDotActive : ''}`}
                            />
                            <span className={styles.navChildLabel}>{child.label}</span>
                          </>
                        )}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
            >
              <span className={`msr ${styles.navIcon}`}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className={styles.bottom}>
        <div className={styles.helpItem}>
          <span className="msr" style={{ fontSize: 20 }}>help</span>
          <span className={styles.navLabel}>Ayuda y Soporte</span>
          <span className="msr" style={{ fontSize: 16, color: '#8fa0cc' }}>expand_more</span>
        </div>
        <div className={styles.footer}>
          <div>© 2026 HealthCore</div>
          <div>Versión 1.0.0</div>
        </div>
      </div>
    </aside>
  );
}
