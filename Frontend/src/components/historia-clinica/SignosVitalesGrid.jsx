import { SIGNOS_VITALES_CAMPOS, calcularImc } from '../../constants/hce';
import styles from '../../styles/historia-clinica/SignosVitalesGrid.module.css';

export default function SignosVitalesGrid({ value, onChange, disabled }) {
  const imc = calcularImc(value.peso, value.talla);

  return (
    <div className={styles.grid}>
      {SIGNOS_VITALES_CAMPOS.map((campo) => (
        <div key={campo.key}>
          <div className={styles.label}>{campo.label}</div>
          <input
            className={`input ${styles.valor}`}
            type="number"
            step="any"
            value={value[campo.key] ?? ''}
            onChange={(e) => onChange(campo.key, e.target.value === '' ? null : e.target.value)}
            disabled={disabled}
          />
        </div>
      ))}
      <div>
        <div className={styles.label}>IMC (calculado)</div>
        <div className={`${styles.valor} ${styles.imc}`}>{imc ?? '—'}</div>
      </div>
    </div>
  );
}
