import CitaChip from './CitaChip';
import { DIAS_SEMANA_CORTOS, addDays, esHoy, mismoDia } from '../../utils/fechas';
import styles from '../../styles/agenda/CalendarGrid.module.css';

export const HORA_INICIO = 7;
export const HORA_FIN = 18; // exclusiva
const ALTO_HORA = 64;

function labelHora(h) {
  if (h === 12) return '12:00 pm';
  return h < 12 ? `${h}:00 am` : `${h - 12}:00 pm`;
}

// Grilla de horas compartida por las vistas Día (dias=1) y Semana (dias=5).
export default function CalendarGrid({ fechaBase, dias, citas, onSlotClick, onCitaClick }) {
  const columnas = Array.from({ length: dias }, (_, i) => addDays(fechaBase, i));
  const horas = Array.from({ length: HORA_FIN - HORA_INICIO }, (_, i) => HORA_INICIO + i);
  const gridTemplate = { gridTemplateColumns: `64px repeat(${dias}, 1fr)` };

  const citasDe = (dia) => citas.filter((c) => mismoDia(new Date(c.inicio), dia));

  const posicion = (cita) => {
    const inicio = new Date(cita.inicio);
    const fin = new Date(cita.fin);
    const minutosDesdeApertura = (inicio.getHours() - HORA_INICIO) * 60 + inicio.getMinutes();
    const duracionMin = Math.max((fin - inicio) / 60000, 20);
    const top = Math.max((minutosDesdeApertura * ALTO_HORA) / 60, 0);
    const height = Math.max((duracionMin * ALTO_HORA) / 60 - 6, 22);
    return { top: top + 3, height };
  };

  return (
    <div>
      <div className={styles.headerRow} style={gridTemplate}>
        <div className={styles.esquina} />
        {columnas.map((dia) => (
          <div key={dia.toISOString()} className={styles.diaHeader}>
            <div className={styles.diaDow}>{DIAS_SEMANA_CORTOS[(dia.getDay() + 6) % 7]}</div>
            <div className={`${styles.diaNum} ${esHoy(dia) ? styles.diaHoy : ''}`}>{dia.getDate()}</div>
          </div>
        ))}
      </div>

      <div className={styles.body} style={gridTemplate}>
        <div>
          {horas.map((h) => (
            <div key={h} className={styles.horaLabel}>{labelHora(h)}</div>
          ))}
        </div>

        {columnas.map((dia) => (
          <div key={dia.toISOString()} className={styles.columnaDia} style={{ height: horas.length * ALTO_HORA }}>
            {horas.map((h) => (
              <div
                key={h}
                className={styles.celdaHora}
                onClick={() => {
                  const fecha = new Date(dia);
                  fecha.setHours(h, 0, 0, 0);
                  onSlotClick?.(fecha);
                }}
              />
            ))}
            {citasDe(dia).map((cita) => {
              const { top, height } = posicion(cita);
              return (
                <CitaChip
                  key={cita.id}
                  cita={cita}
                  onClick={onCitaClick}
                  style={{ position: 'absolute', top, height, left: 3, right: 3 }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
