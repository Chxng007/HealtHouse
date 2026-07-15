import styles from './PermisosRapidosSection.module.css';
import { PERMISOS_MODULOS, PERMISOS_HEADERS } from '../../constants/permisosModulos';

const CAMPOS = ['ver', 'crear', 'editar', 'eliminar', 'imprimir', 'exportar'];

export default function PermisosRapidosSection({ permisos, onToggle }) {
  return (
    <section className="card" style={{ padding: '22px 26px 10px 26px' }}>
      <div className={`sectionHeader ${styles.headerRow}`}>
        <div className="sectionIconBadge">
          <span className="msr" style={{ fontSize: 20, color: 'var(--color-primary)' }}>shield</span>
        </div>
        <div>
          <h2 className="sectionTitle">Permisos Rápidos por Módulo</h2>
          <div className="sectionSubtitle">Configure los permisos del usuario según el rol seleccionado</div>
        </div>
      </div>

      <div className={styles.tableHead}>
        <div className={styles.tableHeadModulo}>Módulo</div>
        {PERMISOS_HEADERS.map((h) => (
          <div key={h} className={styles.tableHeadCell}>{h}</div>
        ))}
      </div>

      {PERMISOS_MODULOS.map((mod) => (
        <div key={mod.modulo} className={styles.tableRow}>
          <div className={styles.moduloCell}>
            <span className="msr" style={{ fontSize: 19, color: mod.iconColor }}>{mod.icono}</span>
            <span className={styles.moduloLabel}>{mod.label}</span>
          </div>
          {CAMPOS.map((campo) => (
            <div key={campo} className={styles.checkCell}>
              <input
                type="checkbox"
                checked={permisos[mod.modulo]?.[campo] ?? false}
                onChange={(e) => onToggle(mod.modulo, campo, e.target.checked)}
              />
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}
