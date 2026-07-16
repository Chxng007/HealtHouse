import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EstadoBadge from '../components/common/EstadoBadge';
import Tabs from '../components/common/Tabs';
import PacienteAvatar from '../components/pacientes/PacienteAvatar';
import { getHistorialPaciente, getPaciente, setEstadoPaciente } from '../api/pacientes.api';
import {
  ESTADOS_CIVILES,
  REGIMENES,
  SEXOS,
  edadDe,
  labelDe,
} from '../constants/pacientes';
import { TIPOS_DOCUMENTO } from '../constants/tiposDocumento';
import { formatDocumento, formatFecha } from '../utils/formato';
import styles from '../styles/pacientes/PacientePerfilPage.module.css';

const TABS = [
  { key: 'datos', label: 'Datos Generales' },
  { key: 'aseguramiento', label: 'Aseguramiento' },
  { key: 'contactos', label: 'Contactos de Emergencia' },
  { key: 'historial', label: 'Historial de Atenciones' },
];

function Campo({ label, children }) {
  return (
    <div>
      <div className={styles.campoLabel}>{label}</div>
      <div className={styles.campoValor}>{children ?? '—'}</div>
    </div>
  );
}

export default function PacientePerfilPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [tab, setTab] = useState('datos');
  const [error, setError] = useState(null);
  const [confirmEstado, setConfirmEstado] = useState(false);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);

  useEffect(() => {
    getPaciente(id).then(setPaciente).catch((err) => setError(err.message));
    getHistorialPaciente(id).then(setHistorial).catch(() => setHistorial([]));
  }, [id]);

  const cambiarEstado = async () => {
    setCambiandoEstado(true);
    try {
      const actualizado = await setEstadoPaciente(id, !paciente.activo);
      setPaciente(actualizado);
      setConfirmEstado(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setCambiandoEstado(false);
    }
  };

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }
  if (!paciente) {
    return <div className={styles.cargando}>Cargando paciente…</div>;
  }

  const grupoRh = paciente.grupoSanguineo
    ? `${paciente.grupoSanguineo}${paciente.rh === 'positivo' ? '+' : paciente.rh === 'negativo' ? '−' : ''}`
    : null;

  return (
    <div className={styles.page}>
      <div className={`card ${styles.headerCard}`}>
        <Link to="/pacientes" className={styles.volverBtn} title="Volver a la lista">
          <span className="msr" style={{ fontSize: 20 }}>arrow_back</span>
        </Link>
        <PacienteAvatar paciente={paciente} size={72} />
        <div className={styles.headerInfo}>
          <div className={styles.headerNombreFila}>
            <h1 className={styles.headerNombre}>{paciente.nombres} {paciente.apellidos}</h1>
            <EstadoBadge variant={paciente.activo ? 'success' : 'neutral'}>
              {paciente.activo ? 'Activo' : 'Inactivo'}
            </EstadoBadge>
          </div>
          <div className={styles.headerMeta}>
            <span>{paciente.tipoDocumento} {formatDocumento(paciente.numeroDocumento)}</span>
            <span>{edadDe(paciente.fechaNacimiento)} años · {labelDe(SEXOS, paciente.sexo)}</span>
            <span>{paciente.eps?.nombre} · {labelDe(REGIMENES, paciente.regimen)}</span>
            {grupoRh && <span>{grupoRh} RH</span>}
          </div>
        </div>
        <button
          type="button"
          className={`btn ${paciente.activo ? 'btnDanger' : 'btnGhost'}`}
          onClick={() => setConfirmEstado(true)}
        >
          <span className="msr" style={{ fontSize: 17 }}>{paciente.activo ? 'person_off' : 'person_check'}</span>
          {paciente.activo ? 'Desactivar' : 'Activar'}
        </button>
        <button type="button" className="btn btnGhost" onClick={() => navigate(`/pacientes/${id}/editar`)}>
          <span className="msr" style={{ fontSize: 17 }}>edit</span> Editar
        </button>
        <button type="button" className="btn btnPrimary" onClick={() => navigate('/agenda')}>
          <span className="msr" style={{ fontSize: 17 }}>event</span> Agendar Cita
        </button>
      </div>

      <div className={`card ${styles.tabsCard}`}>
        <Tabs tabs={TABS} active={tab} onChange={setTab} />
      </div>

      {tab === 'datos' && (
        <section className={`card ${styles.seccion}`}>
          <h2 className={styles.seccionTitulo}>Datos Demográficos</h2>
          <div className={styles.gridCampos}>
            <Campo label="Tipo de Documento">{labelDe(TIPOS_DOCUMENTO, paciente.tipoDocumento)}</Campo>
            <Campo label="Fecha de Nacimiento">{formatFecha(paciente.fechaNacimiento)}</Campo>
            <Campo label="Estado Civil">{paciente.estadoCivil ? labelDe(ESTADOS_CIVILES, paciente.estadoCivil) : '—'}</Campo>
            <Campo label="Ocupación">{paciente.ocupacion}</Campo>
            <Campo label="Grupo Sanguíneo / RH">{grupoRh}</Campo>
            <Campo label="Correo Electrónico">{paciente.correo}</Campo>
            <Campo label="Teléfono">{paciente.telefono}</Campo>
            <Campo label="Dirección de Residencia">{`${paciente.direccion}, ${paciente.municipio}`}</Campo>
            <Campo label="Sede de Registro">{paciente.sedeRegistro?.nombre}</Campo>
          </div>
        </section>
      )}

      {tab === 'aseguramiento' && (
        <section className={`card ${styles.seccion}`}>
          <h2 className={styles.seccionTitulo}>Información de Aseguramiento</h2>
          <div className={styles.gridCampos3}>
            <Campo label="EPS">{paciente.eps?.nombre}</Campo>
            <Campo label="Régimen">{labelDe(REGIMENES, paciente.regimen)}</Campo>
            <Campo label="No. de Afiliación">{paciente.nroAfiliacion}</Campo>
          </div>
        </section>
      )}

      {tab === 'contactos' && (
        <section className={`card ${styles.seccionTabla}`}>
          <h2 className={`${styles.seccionTitulo} ${styles.seccionTituloTabla}`}>Contactos de Emergencia</h2>
          <div className={styles.tablaHeader}>
            <div>Nombre</div><div>Parentesco</div><div>Teléfono</div><div>Dirección</div>
          </div>
          {paciente.contactos.length === 0 && (
            <div className={styles.tablaVacia}>Sin contactos de emergencia registrados.</div>
          )}
          {paciente.contactos.map((c) => (
            <div key={c.id} className={styles.tablaFila}>
              <div className={styles.tablaNombre}>{c.nombre}</div>
              <div>{c.parentesco}</div>
              <div>{c.telefono}</div>
              <div>{c.direccion ?? '—'}</div>
            </div>
          ))}
        </section>
      )}

      {tab === 'historial' && (
        <section className={`card ${styles.seccionTabla}`}>
          <h2 className={`${styles.seccionTitulo} ${styles.seccionTituloTabla}`}>Historial de Atenciones</h2>
          <div className={styles.tablaHeaderHistorial}>
            <div>Fecha</div><div>Médico</div><div>Tipo</div><div>Diagnóstico</div><div>Factura</div>
          </div>
          {historial.length === 0 && (
            <div className={styles.tablaVacia}>
              Sin atenciones registradas. El historial se llenará con las atenciones, citas y facturas del paciente.
            </div>
          )}
          {historial.map((h) => (
            <div key={h.id} className={styles.tablaFilaHistorial}>
              <div>{formatFecha(h.fecha)}</div>
              <div className={styles.tablaNombre}>{h.medico}</div>
              <div>{h.tipo}</div>
              <div>{h.diagnostico}</div>
              <div>{h.factura ?? '—'}</div>
            </div>
          ))}
        </section>
      )}

      <ConfirmDialog
        open={confirmEstado}
        title={paciente.activo ? 'Desactivar Paciente' : 'Activar Paciente'}
        message={
          paciente.activo
            ? `¿Deseas desactivar a ${paciente.nombres} ${paciente.apellidos}? No aparecerá en las búsquedas activas.`
            : `¿Deseas activar nuevamente a ${paciente.nombres} ${paciente.apellidos}?`
        }
        confirmLabel={paciente.activo ? 'Desactivar' : 'Activar'}
        danger={paciente.activo}
        loading={cambiandoEstado}
        onConfirm={cambiarEstado}
        onCancel={() => setConfirmEstado(false)}
      />
    </div>
  );
}
