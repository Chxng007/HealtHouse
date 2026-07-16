import { useCallback, useEffect, useState } from 'react';
import ConfirmDialog from '../components/common/ConfirmDialog';
import DataTable from '../components/common/DataTable';
import EstadoBadge from '../components/common/EstadoBadge';
import PacienteAvatar from '../components/pacientes/PacienteAvatar';
import AdmisionWizard from '../components/admisiones/AdmisionWizard';
import { getListaEspera, listAdmisiones, setEstadoAdmision } from '../api/admisiones.api';
import { getMedicos } from '../api/catalogosAgenda.api';
import { getSedes } from '../api/sedes.api';
import { ACCIONES_ADMISION, estadoAdmision, labelTipoAtencion } from '../constants/admisiones';
import { formatDocumento } from '../utils/formato';
import { formatHora } from '../utils/fechas';
import styles from '../styles/admisiones/AdmisionesPage.module.css';

function minutosDesde(fecha) {
  return Math.max(Math.round((Date.now() - new Date(fecha).getTime()) / 60000), 0);
}

export default function AdmisionesPage() {
  const [sedes, setSedes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [espera, setEspera] = useState([]);
  const [admisiones, setAdmisiones] = useState([]);
  const [pacienteVerificado, setPacienteVerificado] = useState(null);
  const [confirmCancelar, setConfirmCancelar] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getSedes().then(setSedes).catch(() => setSedes([]));
    getMedicos().then(setMedicos).catch(() => setMedicos([]));
  }, []);

  const refrescar = useCallback(() => {
    getListaEspera().then(setEspera).catch(() => setEspera([]));
    listAdmisiones().then(setAdmisiones).catch((err) => setError(err.message));
  }, []);

  useEffect(refrescar, [refrescar]);

  const cambiarEstado = async (admision, estado) => {
    if (estado === 'cancelado') {
      setConfirmCancelar(admision);
      return;
    }
    setProcesando(true);
    try {
      await setEstadoAdmision(admision.id, estado);
      refrescar();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(false);
    }
  };

  const confirmarCancelacion = async () => {
    setProcesando(true);
    try {
      await setEstadoAdmision(confirmCancelar.id, 'cancelado');
      setConfirmCancelar(null);
      refrescar();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(false);
    }
  };

  const columns = [
    { key: 'hora', header: 'Llegada', width: '0.6fr', render: (a) => formatHora(a.horaLlegada) },
    {
      key: 'paciente',
      header: 'Paciente',
      width: '1.5fr',
      render: (a) => (
        <div>
          <div className={styles.nombre}>{a.paciente.nombres} {a.paciente.apellidos}</div>
          <div className={styles.sub}>{formatDocumento(a.paciente.numeroDocumento)}</div>
        </div>
      ),
    },
    { key: 'tipo', header: 'Tipo', width: '0.9fr', render: (a) => labelTipoAtencion(a.tipoAtencion) },
    {
      key: 'medico',
      header: 'Médico',
      width: '1.1fr',
      render: (a) => `${a.medico.nombres} ${a.medico.apellidos}`,
    },
    {
      key: 'origen',
      header: 'Origen',
      width: '0.8fr',
      render: (a) => (a.cita ? `Cita ${formatHora(a.cita.inicio)}` : 'Walk-in'),
    },
    {
      key: 'estado',
      header: 'Estado',
      width: '0.9fr',
      render: (a) => {
        const e = estadoAdmision(a.estado);
        return <EstadoBadge variant={e.badge}>{e.label}</EstadoBadge>;
      },
    },
    {
      key: 'acciones',
      header: 'Acciones',
      width: '1.4fr',
      align: 'right',
      render: (a) => (
        <div className={styles.acciones}>
          {(ACCIONES_ADMISION[a.estado] ?? []).map((accion) => (
            <button
              key={accion.estado}
              type="button"
              className={`btn ${accion.variante} ${styles.btnChico}`}
              onClick={() => cambiarEstado(a, accion.estado)}
              disabled={procesando}
            >
              {accion.label}
            </button>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className={styles.layout}>
      <div className={styles.columnaPrincipal}>
        <AdmisionWizard
          sedes={sedes}
          medicos={medicos}
          onPacienteSeleccionado={setPacienteVerificado}
          onAdmitida={refrescar}
        />

        <section className="card">
          <div className={styles.colaHeader}>
            <h2 className={styles.colaTitulo}>Admisiones de Hoy</h2>
            <span className={styles.colaContador}>{admisiones.length} registradas</span>
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <DataTable
            columns={columns}
            rows={admisiones}
            emptyMessage="Aún no hay admisiones registradas hoy"
            itemLabel="admisiones"
          />
        </section>
      </div>

      <div className={styles.panelLateral}>
        {pacienteVerificado && (
          <section className={`card ${styles.panelCard}`}>
            <div className={styles.panelHeader}>
              <span className="msr" style={{ fontSize: 18, color: 'var(--color-primary)' }}>badge</span>
              <div className={styles.panelTitulo}>Paciente Verificado</div>
            </div>
            <div className={styles.pacienteFila}>
              <PacienteAvatar paciente={pacienteVerificado} size={48} />
              <div>
                <div className={styles.nombre}>{pacienteVerificado.nombres} {pacienteVerificado.apellidos}</div>
                <div className={styles.sub}>
                  {pacienteVerificado.tipoDocumento} {formatDocumento(pacienteVerificado.numeroDocumento)} · {pacienteVerificado.eps?.nombre}
                </div>
              </div>
            </div>
          </section>
        )}

        <section className={`card ${styles.panelCard}`}>
          <div className={styles.esperaHeader}>
            <div className={styles.panelTitulo}>Lista de Espera</div>
            <span className={styles.esperaBadge}>{espera.length} en espera</span>
          </div>
          {espera.length === 0 && <div className={styles.sinEspera}>No hay pacientes en espera.</div>}
          <div className={styles.esperaLista}>
            {espera.map((a, i) => (
              <div key={a.id} className={styles.esperaItem}>
                <span className={styles.esperaPos}>{i + 1}</span>
                <div className={styles.esperaInfo}>
                  <div className={styles.esperaNombre}>{a.paciente.nombres} {a.paciente.apellidos}</div>
                  <div className={styles.esperaMotivo}>{labelTipoAtencion(a.tipoAtencion)}</div>
                </div>
                <span className={styles.esperaTiempo}>{minutosDesde(a.horaLlegada)} min</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={!!confirmCancelar}
        title="Cancelar Admisión"
        message={
          confirmCancelar
            ? `¿Deseas cancelar la admisión de ${confirmCancelar.paciente.nombres} ${confirmCancelar.paciente.apellidos}? Si venía de una cita, la cita también se cancelará.`
            : ''
        }
        confirmLabel="Cancelar Admisión"
        danger
        loading={procesando}
        onConfirm={confirmarCancelacion}
        onCancel={() => setConfirmCancelar(null)}
      />
    </div>
  );
}
