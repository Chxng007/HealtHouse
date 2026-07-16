import styles from '../../styles/agenda/CitaChip.module.css';

export default function CitaChip({ cita, onClick, style, compacto = false }) {
  const paciente = `${cita.paciente.nombres[0]}. ${cita.paciente.apellidos.split(' ')[0]}`;
  const medico = `${cita.medico.cargoProfesion?.startsWith('Médic') ? 'Dr.' : 'Dra./Dr.'} ${cita.medico.apellidos.split(' ')[0]}`;

  return (
    <button
      type="button"
      className={`${styles.chip} ${styles[cita.estado] ?? ''} ${compacto ? styles.compacto : ''}`}
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(cita);
      }}
      title={`${cita.paciente.nombres} ${cita.paciente.apellidos} — ${cita.medico.nombres} ${cita.medico.apellidos}`}
    >
      <div className={styles.titulo}>{paciente}</div>
      {!compacto && <div className={styles.sub}>{medico}</div>}
    </button>
  );
}
