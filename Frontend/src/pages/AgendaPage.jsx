import { useCallback, useEffect, useMemo, useState } from 'react';
import CalendarGrid from '../components/agenda/CalendarGrid';
import CalendarMonth from '../components/agenda/CalendarMonth';
import CitaDetalleModal from '../components/agenda/CitaDetalleModal';
import CitaFormModal from '../components/agenda/CitaFormModal';
import { getCitasHoy, listCitas } from '../api/agenda.api';
import { getConsultorios, getMedicos } from '../api/catalogosAgenda.api';
import { getSedes } from '../api/sedes.api';
import { ESTADOS_CITA } from '../constants/citas';
import {
  addDays,
  addMonths,
  formatHora,
  labelDia,
  labelMes,
  labelRangoSemana,
  startOfMonth,
  startOfWeek,
} from '../utils/fechas';
import styles from '../styles/agenda/AgendaPage.module.css';

const VISTAS = [
  { key: 'dia', label: 'Día' },
  { key: 'semana', label: 'Semana' },
  { key: 'mes', label: 'Mes' },
];

export default function AgendaPage() {
  const [vista, setVista] = useState('semana');
  const [fecha, setFecha] = useState(new Date());
  const [medicoId, setMedicoId] = useState('');
  const [citas, setCitas] = useState([]);
  const [citasHoy, setCitasHoy] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [consultorios, setConsultorios] = useState([]);
  const [formAbierto, setFormAbierto] = useState(false);
  const [fechaForm, setFechaForm] = useState(null);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getSedes().then(setSedes).catch(() => setSedes([]));
    getMedicos().then(setMedicos).catch(() => setMedicos([]));
    getConsultorios().then(setConsultorios).catch(() => setConsultorios([]));
  }, []);

  const rango = useMemo(() => {
    if (vista === 'dia') {
      const desde = new Date(fecha);
      desde.setHours(0, 0, 0, 0);
      return { desde, hasta: addDays(desde, 1) };
    }
    if (vista === 'semana') {
      const desde = startOfWeek(fecha);
      return { desde, hasta: addDays(desde, 7) };
    }
    const desde = startOfWeek(startOfMonth(fecha));
    return { desde, hasta: addDays(desde, 42) };
  }, [vista, fecha]);

  const refrescar = useCallback(() => {
    listCitas({ ...rango, medicoId: medicoId || undefined })
      .then((res) => {
        setCitas(res);
        setError(null);
      })
      .catch((err) => setError(err.message));
    getCitasHoy().then(setCitasHoy).catch(() => setCitasHoy([]));
  }, [rango, medicoId]);

  useEffect(refrescar, [refrescar]);

  const mover = (direccion) => {
    if (vista === 'dia') setFecha((f) => addDays(f, direccion));
    else if (vista === 'semana') setFecha((f) => addDays(f, 7 * direccion));
    else setFecha((f) => addMonths(f, direccion));
  };

  const labelRango =
    vista === 'dia' ? labelDia(fecha) : vista === 'semana' ? labelRangoSemana(startOfWeek(fecha)) : labelMes(fecha);

  const abrirForm = (fechaSlot) => {
    setFechaForm(fechaSlot ?? null);
    setFormAbierto(true);
  };

  return (
    <div className={styles.layout}>
      <section className={`card ${styles.calendario}`}>
        <div className={styles.toolbar}>
          <div className={styles.navBtns}>
            <button type="button" className={styles.navBtn} onClick={() => mover(-1)} aria-label="Anterior">
              <span className="msr" style={{ fontSize: 18 }}>chevron_left</span>
            </button>
            <button type="button" className={styles.navBtn} onClick={() => mover(1)} aria-label="Siguiente">
              <span className="msr" style={{ fontSize: 18 }}>chevron_right</span>
            </button>
          </div>
          <div className={styles.rangoLabel}>{labelRango}</div>
          <div className={styles.espaciador} />
          <div className={styles.vistaToggle}>
            {VISTAS.map((v) => (
              <button
                key={v.key}
                type="button"
                className={`${styles.vistaBtn} ${vista === v.key ? styles.vistaActiva : ''}`}
                onClick={() => setVista(v.key)}
              >
                {v.label}
              </button>
            ))}
          </div>
          <div className={styles.medicoSelect}>
            <select className="select" value={medicoId} onChange={(e) => setMedicoId(e.target.value)}>
              <option value="">Todos los médicos</option>
              {medicos.map((m) => (
                <option key={m.id} value={m.id}>{m.nombres} {m.apellidos}</option>
              ))}
            </select>
            <span className={`msr ${styles.selectChevron}`}>expand_more</span>
          </div>
          <button type="button" className="btn btnPrimary" onClick={() => abrirForm(null)}>
            <span className="msr" style={{ fontSize: 17 }}>add</span> Nueva Cita
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {vista === 'semana' && (
          <CalendarGrid
            fechaBase={startOfWeek(fecha)}
            dias={5}
            citas={citas}
            onSlotClick={abrirForm}
            onCitaClick={setCitaSeleccionada}
          />
        )}
        {vista === 'dia' && (
          <CalendarGrid
            fechaBase={fecha}
            dias={1}
            citas={citas}
            onSlotClick={abrirForm}
            onCitaClick={setCitaSeleccionada}
          />
        )}
        {vista === 'mes' && (
          <CalendarMonth
            fechaBase={fecha}
            citas={citas}
            onDayClick={(dia) => {
              setFecha(dia);
              setVista('dia');
            }}
            onCitaClick={setCitaSeleccionada}
          />
        )}
      </section>

      <div className={styles.panelLateral}>
        <section className={`card ${styles.panelCard}`}>
          <div className={styles.panelTitulo}>Estados de Cita</div>
          <div className={styles.leyenda}>
            {ESTADOS_CITA.map((estado) => (
              <div key={estado.value} className={styles.leyendaItem}>
                <span className={`${styles.leyendaColor} ${styles[`leyenda_${estado.value}`]}`} />
                <span className={styles.leyendaLabel}>{estado.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={`card ${styles.panelCard}`}>
          <div className={styles.panelTitulo}>Citas de Hoy</div>
          {citasHoy.length === 0 && <div className={styles.sinCitas}>No hay citas para hoy.</div>}
          <div className={styles.citasHoy}>
            {citasHoy.map((cita) => (
              <button
                key={cita.id}
                type="button"
                className={`${styles.citaHoyItem} ${styles[`borde_${cita.estado}`]}`}
                onClick={() => setCitaSeleccionada(cita)}
              >
                <div className={styles.citaHoyTitulo}>
                  {formatHora(cita.inicio)} · {cita.paciente.nombres.split(' ')[0]} {cita.paciente.apellidos.split(' ')[0]}
                </div>
                <div className={styles.citaHoySub}>
                  {cita.medico.nombres.split(' ')[0]} {cita.medico.apellidos.split(' ')[0]} · {cita.consultorio.nombre}
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      <CitaFormModal
        open={formAbierto}
        fechaInicial={fechaForm}
        sedes={sedes}
        medicos={medicos}
        consultorios={consultorios}
        onClose={() => setFormAbierto(false)}
        onCreada={() => {
          setFormAbierto(false);
          refrescar();
        }}
      />

      <CitaDetalleModal
        cita={citaSeleccionada}
        onClose={() => setCitaSeleccionada(null)}
        onActualizada={() => {
          setCitaSeleccionada(null);
          refrescar();
        }}
      />
    </div>
  );
}
