import styles from '../../styles/admisiones/Stepper.module.css';

export default function Stepper({ pasos, actual }) {
  return (
    <div className={styles.stepper}>
      {pasos.map((paso, i) => {
        const estado = i < actual ? 'done' : i === actual ? 'active' : 'pending';
        return (
          <div key={paso} className={styles.paso}>
            <div className={styles.circuloWrap}>
              <div className={`${styles.circulo} ${styles[estado]}`}>
                {estado === 'done' ? <span className="msr" style={{ fontSize: 18 }}>check</span> : i + 1}
              </div>
              <div className={`${styles.label} ${estado === 'pending' ? styles.labelPendiente : ''}`}>{paso}</div>
            </div>
            {i < pasos.length - 1 && (
              <div className={`${styles.linea} ${i < actual ? styles.lineaDone : ''}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
