import styles from '../../styles/pacientes/PacienteAvatar.module.css';

export default function PacienteAvatar({ paciente, size = 38 }) {
  const style = { width: size, height: size, fontSize: size * 0.36 };

  if (paciente?.fotoUrl) {
    return (
      <img
        src={paciente.fotoUrl}
        alt={`${paciente.nombres} ${paciente.apellidos}`}
        className={styles.foto}
        style={style}
      />
    );
  }

  const iniciales = `${paciente?.nombres?.[0] ?? ''}${paciente?.apellidos?.[0] ?? ''}`.toUpperCase();
  return (
    <span className={styles.iniciales} style={style} aria-hidden="true">
      {iniciales || '?'}
    </span>
  );
}
