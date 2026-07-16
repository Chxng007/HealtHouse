import CitaChip from './CitaChip';
import { DIAS_SEMANA_CORTOS, addDays, esHoy, mismoDia, startOfMonth, startOfWeek } from '../../utils/fechas';
import styles from '../../styles/agenda/CalendarMonth.module.css';

const MAX_CHIPS = 3;

export default function CalendarMonth({ fechaBase, citas, onDayClick, onCitaClick }) {
  const inicioMes = startOfMonth(fechaBase);
  const inicioGrilla = startOfWeek(inicioMes);
  const mes = inicioMes.getMonth();

  // 6 semanas cubren cualquier mes.
  const semanas = Array.from({ length: 6 }, (_, s) =>
    Array.from({ length: 7 }, (_, d) => addDays(inicioGrilla, s * 7 + d)),
  );

  const citasDe = (dia) => citas.filter((c) => mismoDia(new Date(c.inicio), dia));

  return (
    <div>
      <div className={styles.headerRow}>
        {DIAS_SEMANA_CORTOS.map((dow) => (
          <div key={dow} className={styles.dowHeader}>{dow}</div>
        ))}
      </div>
      {semanas.map((semana, i) => (
        <div key={i} className={styles.semanaRow}>
          {semana.map((dia) => {
            const delMes = dia.getMonth() === mes;
            const citasDia = citasDe(dia);
            return (
              <div
                key={dia.toISOString()}
                className={`${styles.celdaDia} ${delMes ? '' : styles.otroMes}`}
                onClick={() => onDayClick?.(dia)}
              >
                <div className={`${styles.numDia} ${esHoy(dia) ? styles.hoy : ''}`}>{dia.getDate()}</div>
                <div className={styles.chips}>
                  {citasDia.slice(0, MAX_CHIPS).map((cita) => (
                    <CitaChip key={cita.id} cita={cita} onClick={onCitaClick} compacto />
                  ))}
                  {citasDia.length > MAX_CHIPS && (
                    <div className={styles.masChip}>+{citasDia.length - MAX_CHIPS} más</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
