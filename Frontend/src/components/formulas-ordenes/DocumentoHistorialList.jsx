import EstadoBadge from '../common/EstadoBadge';
import { formatFecha } from '../../utils/formato';
import { formatHora } from '../../utils/fechas';
import styles from '../../styles/formulas-ordenes/DocumentoHistorialList.module.css';

export default function DocumentoHistorialList({
  documentos,
  seleccionadoId,
  renderResumen,
  renderMeta,
  estadoDe,
  onSeleccionar,
  onAnular,
  puedeAnular,
  emptyMessage = 'Sin documentos registrados para este paciente.',
}) {
  if (documentos.length === 0) {
    return <div className={styles.vacio}>{emptyMessage}</div>;
  }

  return (
    <div className={styles.lista}>
      {documentos.map((doc) => {
        const estado = estadoDe(doc);
        return (
          <div key={doc.id} className={`${styles.item} ${doc.id === seleccionadoId ? styles.itemActivo : ''}`}>
            <button type="button" className={styles.itemBoton} onClick={() => onSeleccionar(doc)}>
              <div className={styles.itemFecha}>
                {formatFecha(doc.fecha)}<span className={styles.itemHora}>{formatHora(doc.fecha)}</span>
              </div>
              <div className={styles.itemInfo}>
                <div className={styles.itemResumen}>{renderResumen(doc)}</div>
                {renderMeta && <div className={styles.itemMeta}>{renderMeta(doc)}</div>}
              </div>
              <EstadoBadge variant={estado.badge}>{estado.label}</EstadoBadge>
            </button>
            {puedeAnular(doc) && (
              <button type="button" className={styles.anularBtn} onClick={() => onAnular(doc)} title="Anular">
                <span className="msr" style={{ fontSize: 16 }}>block</span>
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
