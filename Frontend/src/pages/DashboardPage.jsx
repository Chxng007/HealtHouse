import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import EstadoBadge from '../components/common/EstadoBadge';
import PacienteAvatar from '../components/pacientes/PacienteAvatar';
import { getDashboardKpis } from '../api/dashboard.api';
import { labelEstadoCita } from '../constants/citas';
import { formatMoneda } from '../utils/formato';
import { formatHora, labelDia } from '../utils/fechas';
import styles from '../styles/dashboard/DashboardPage.module.css';

const BADGE_POR_ESTADO = {
  agendada: 'neutral',
  confirmada: 'primary',
  en_atencion: 'warning',
  atendida: 'success',
  cancelada: 'danger',
  no_asistio: 'neutral',
};

const ACCESOS_RAPIDOS = [
  { label: 'Nuevo Paciente', icon: 'person_add', bg: 'var(--color-primary-bg)', color: 'var(--color-primary)', href: '/pacientes/nuevo' },
  { label: 'Nueva Cita', icon: 'event', bg: 'var(--color-success-bg)', color: 'var(--color-success-dark)', href: '/agenda' },
  { label: 'Nueva Admisión', icon: 'how_to_reg', bg: 'var(--color-warning-bg)', color: 'var(--color-amber)', href: '/admisiones' },
  { label: 'Generar Factura', icon: 'receipt_long', bg: 'var(--color-pink-bg)', color: 'var(--color-pink)', href: '/facturacion' },
  { label: 'Registrar Pago', icon: 'payments', bg: '#ede9fe', color: '#7c3aed', href: '/caja-pagos' },
  { label: 'Generar RIPS', icon: 'description', bg: '#e0f2fe', color: '#0284c7', href: '/rips' },
];

export default function DashboardPage() {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getDashboardKpis().then(setDatos).catch((err) => setError(err.message));
  }, []);

  if (error) return <div className={styles.error}>{error}</div>;
  if (!datos) return <div className={styles.cargando}>Cargando…</div>;

  return (
    <div className={styles.page}>
      <div>
        <div className={styles.saludo}>Hola, Administrador 👋</div>
        <div className={styles.fecha}>{labelDia(new Date())}</div>
      </div>

      <div className={styles.kpisGrid}>
        <div className={`card ${styles.kpiCard}`}>
          <div className={`${styles.kpiIcono} ${styles.tonePrimary}`}><span className="msr" style={{ fontSize: 23 }}>event_available</span></div>
          <div><div className={styles.kpiValor}>{datos.citasHoy}</div><div className={styles.kpiLabel}>Citas Hoy</div></div>
        </div>
        <div className={`card ${styles.kpiCard}`}>
          <div className={`${styles.kpiIcono} ${styles.toneSuccess}`}><span className="msr" style={{ fontSize: 23 }}>groups</span></div>
          <div><div className={styles.kpiValor}>{datos.pacientesActivos}</div><div className={styles.kpiLabel}>Pacientes Activos</div></div>
        </div>
        <div className={`card ${styles.kpiCard}`}>
          <div className={`${styles.kpiIcono} ${styles.toneAmber}`}><span className="msr" style={{ fontSize: 23 }}>payments</span></div>
          <div><div className={styles.kpiValor}>{formatMoneda(datos.recaudoCajaHoy)}</div><div className={styles.kpiLabel}>Recaudo en Caja Hoy</div></div>
        </div>
        <div className={`card ${styles.kpiCard}`}>
          <div className={`${styles.kpiIcono} ${styles.tonePink}`}><span className="msr" style={{ fontSize: 23 }}>hourglass_top</span></div>
          <div><div className={styles.kpiValor}>{datos.listaEspera}</div><div className={styles.kpiLabel}>En Lista de Espera</div></div>
        </div>
      </div>

      <div className={styles.main}>
        <section className="card">
          <div className={styles.seccionHeader}>
            <div className={styles.seccionTitulo}>Próximas Citas de Hoy</div>
            <Link to="/agenda" className={styles.verMas}>Ver agenda completa →</Link>
          </div>
          {datos.proximasCitas.length === 0 && <div className={styles.vacio}>No hay citas activas programadas para hoy.</div>}
          {datos.proximasCitas.map((c) => {
            const partes = c.paciente.split(' ');
            const pacienteAvatar = { nombres: partes[0], apellidos: partes[partes.length - 1], fotoUrl: c.fotoUrl };
            return (
            <div key={c.id} className={styles.citaFila}>
              <div className={styles.citaHora}>{formatHora(c.hora)}</div>
              <PacienteAvatar paciente={pacienteAvatar} size={36} />
              <div className={styles.citaInfo}>
                <div className={styles.citaPaciente}>{c.paciente}</div>
                <div className={styles.citaSub}>{c.medico} · {c.consultorio}</div>
              </div>
              <EstadoBadge variant={BADGE_POR_ESTADO[c.estado] ?? 'neutral'}>{labelEstadoCita(c.estado)}</EstadoBadge>
            </div>
            );
          })}
        </section>

        <section className="card" style={{ padding: '20px 22px' }}>
          <div className={styles.accesosTitulo}>Accesos Rápidos</div>
          <div className={styles.accesosGrid}>
            {ACCESOS_RAPIDOS.map((a) => (
              <Link key={a.label} to={a.href} className={styles.accesoCard}>
                <span className={styles.accesoIcono} style={{ background: a.bg }}>
                  <span className="msr" style={{ fontSize: 17, color: a.color }}>{a.icon}</span>
                </span>
                <span className={styles.accesoLabel}>{a.label}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <section className="card">
        <div className={styles.seccionHeader}>
          <div className={styles.seccionTitulo}>Actividad Reciente</div>
        </div>
        {datos.actividadReciente.length === 0 && <div className={styles.vacio}>Sin actividad registrada aún.</div>}
        {datos.actividadReciente.map((a) => (
          <div key={a.id} className={styles.actividadFila}>
            <span className="msr" style={{ fontSize: 19, color: a.color }}>{a.icon}</span>
            <div className={styles.actividadTexto}>{a.texto}</div>
            <div className={styles.actividadTiempo}>{a.tiempo}</div>
          </div>
        ))}
      </section>
    </div>
  );
}
