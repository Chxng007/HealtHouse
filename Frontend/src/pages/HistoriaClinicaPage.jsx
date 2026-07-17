import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EstadoBadge from '../components/common/EstadoBadge';
import SearchSelect from '../components/common/SearchSelect';
import PacienteAvatar from '../components/pacientes/PacienteAvatar';
import NuevaAtencionModal from '../components/historia-clinica/NuevaAtencionModal';
import { listAtenciones } from '../api/historiaClinica.api';
import { listPacientes } from '../api/pacientes.api';
import { getMedicos } from '../api/catalogosAgenda.api';
import { getSedes } from '../api/sedes.api';
import { estadoAtencion } from '../constants/hce';
import { edadDe, labelDe, REGIMENES } from '../constants/pacientes';
import { formatDocumento, formatFecha } from '../utils/formato';
import { formatHora } from '../utils/fechas';
import styles from '../styles/historia-clinica/HistoriaClinicaPage.module.css';

export default function HistoriaClinicaPage() {
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState(null);
  const [atenciones, setAtenciones] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  useEffect(() => {
    getSedes().then(setSedes).catch(() => setSedes([]));
    getMedicos().then(setMedicos).catch(() => setMedicos([]));
  }, []);

  const refrescar = useCallback((pac) => {
    if (!pac) return;
    setCargando(true);
    listAtenciones(pac.id)
      .then((res) => {
        setAtenciones(res);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => refrescar(paciente), [paciente, refrescar]);

  const buscarPacientes = useMemo(
    () => async (query) => {
      const esDocumento = /^\d+$/.test(query);
      const res = await listPacientes(esDocumento ? { documento: query, pageSize: 8 } : { search: query, pageSize: 8 });
      return res.data;
    },
    [],
  );

  return (
    <div className={styles.page}>
      <section className={`card ${styles.buscadorCard}`}>
        <div className="fieldLabel">Buscar Paciente</div>
        <SearchSelect
          value={paciente}
          onChange={setPaciente}
          fetcher={buscarPacientes}
          getLabel={(p) => `${p.nombres} ${p.apellidos}`}
          getSublabel={(p) => `${p.tipoDocumento} ${formatDocumento(p.numeroDocumento)} · ${p.eps?.nombre ?? ''}`}
          placeholder="Nombre, apellido o documento…"
        />
      </section>

      {paciente && (
        <section className={`card ${styles.pacienteCard}`}>
          <PacienteAvatar paciente={paciente} size={56} />
          <div className={styles.pacienteInfo}>
            <div className={styles.pacienteNombre}>{paciente.nombres} {paciente.apellidos}</div>
            <div className={styles.pacienteMeta}>
              {paciente.tipoDocumento} {formatDocumento(paciente.numeroDocumento)} · {edadDe(paciente.fechaNacimiento)} años · {paciente.eps?.nombre}
              {paciente.regimen && ` · ${labelDe(REGIMENES, paciente.regimen)}`}
            </div>
          </div>
          <button type="button" className="btn btnPrimary" onClick={() => setModalAbierto(true)}>
            <span className="msr" style={{ fontSize: 18 }}>add</span> Nueva Atención
          </button>
        </section>
      )}

      {paciente && (
        <section className={`card ${styles.timelineCard}`}>
          <h2 className={styles.timelineTitulo}>Historia Clínica</h2>
          {error && <div className={styles.error}>{error}</div>}
          {cargando && <div className={styles.estadoVacio}>Cargando…</div>}
          {!cargando && atenciones.length === 0 && (
            <div className={styles.estadoVacio}>Este paciente aún no tiene atenciones registradas.</div>
          )}
          <div className={styles.timeline}>
            {atenciones.map((a) => {
              const e = estadoAtencion(a.estado);
              const principal = a.diagnosticos.find((d) => d.tipo === 'principal') ?? a.diagnosticos[0];
              return (
                <button
                  key={a.id}
                  type="button"
                  className={styles.item}
                  onClick={() => navigate(`/historia-clinica/atencion/${a.id}`)}
                >
                  <div className={styles.itemFecha}>
                    <div>{formatFecha(a.fecha)}</div>
                    <div className={styles.itemHora}>{formatHora(a.fecha)}</div>
                  </div>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemMotivo}>{a.motivoConsulta}</div>
                    <div className={styles.itemSub}>
                      {a.medico.nombres} {a.medico.apellidos} · {a.sede.nombre}
                      {principal && ` · ${principal.cie10.codigo} ${principal.cie10.descripcion}`}
                    </div>
                  </div>
                  <EstadoBadge variant={e.badge}>{e.label}</EstadoBadge>
                  <span className="msr" style={{ fontSize: 20, color: 'var(--text-placeholder)' }}>chevron_right</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <NuevaAtencionModal
        open={modalAbierto}
        paciente={paciente}
        sedes={sedes}
        medicos={medicos}
        onClose={() => setModalAbierto(false)}
        onCreada={(atencion) => {
          setModalAbierto(false);
          navigate(`/historia-clinica/atencion/${atencion.id}`);
        }}
      />
    </div>
  );
}
