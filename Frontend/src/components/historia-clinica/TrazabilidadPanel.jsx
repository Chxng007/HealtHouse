import { labelTraza } from '../../constants/hce';
import { formatFecha } from '../../utils/formato';
import { formatHora } from '../../utils/fechas';
import styles from '../../styles/historia-clinica/TrazabilidadPanel.module.css';

export default function TrazabilidadPanel({ trazas }) {
  return (
    <div className={styles.panelLateral}>
      <section className={`card ${styles.card}`}>
        <div className={styles.header}>
          <span className="msr" style={{ fontSize: 18, color: 'var(--color-primary)' }}>history_edu</span>
          <div className={styles.titulo}>Trazabilidad</div>
        </div>
        {trazas.length === 0 && <div className={styles.vacio}>Sin eventos registrados aún.</div>}
        <div className={styles.lista}>
          {trazas.map((t) => (
            <div key={t.id} className={styles.item}>
              <div className={styles.dot} />
              <div>
                <div className={styles.accion}>{labelTraza(t.accion)}</div>
                <div className={styles.meta}>Sistema · {formatFecha(t.createdAt)}, {formatHora(t.createdAt)}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.banner}>
        <span className="msr" style={{ fontSize: 19, color: 'var(--color-primary)', marginTop: 1 }}>gpp_maybe</span>
        <div className={styles.bannerTexto}>
          No se permite eliminar registros clínicos, solo anular con justificación (Res. 3100 de 2019).
        </div>
      </section>
    </div>
  );
}
