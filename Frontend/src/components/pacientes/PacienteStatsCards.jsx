import styles from '../../styles/pacientes/PacienteStatsCards.module.css';

export default function PacienteStatsCards({ stats }) {
  const cards = [
    { icon: 'groups', tone: styles.tonePrimary, value: stats?.total, label: 'Total de Pacientes' },
    { icon: 'person_add', tone: styles.toneSuccess, value: stats?.nuevosMes, label: 'Nuevos este Mes' },
    { icon: 'event_available', tone: styles.toneAmber, value: stats?.citasHoy, label: 'Citas Hoy' },
    { icon: 'history', tone: styles.tonePink, value: stats?.atencionesSemana, label: 'Atenciones esta Semana' },
  ];

  return (
    <div className={styles.grid}>
      {cards.map((card) => (
        <div key={card.label} className={`card ${styles.card}`}>
          <div className={`${styles.iconBadge} ${card.tone}`}>
            <span className="msr" style={{ fontSize: 23 }}>{card.icon}</span>
          </div>
          <div>
            <div className={styles.value}>{card.value ?? '—'}</div>
            <div className={styles.label}>{card.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
