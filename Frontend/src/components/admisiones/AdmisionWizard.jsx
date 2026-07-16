import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SearchSelect from '../common/SearchSelect';
import Stepper from './Stepper';
import { createAdmision, getCitasHoyDePaciente } from '../../api/admisiones.api';
import { listPacientes } from '../../api/pacientes.api';
import { TIPOS_ATENCION, labelTipoAtencion } from '../../constants/admisiones';
import { REGIMENES, labelDe } from '../../constants/pacientes';
import { formatDocumento } from '../../utils/formato';
import { formatHora } from '../../utils/fechas';
import styles from '../../styles/admisiones/AdmisionWizard.module.css';

const PASOS = ['Verificación de Datos', 'Tipo de Atención', 'Autorización EPS', 'Asignación Médico', 'Confirmación'];

export default function AdmisionWizard({ sedes, medicos, onPacienteSeleccionado, onAdmitida }) {
  const [paso, setPaso] = useState(0);
  const [paciente, setPaciente] = useState(null);
  const [citasHoy, setCitasHoy] = useState([]);
  const [citaId, setCitaId] = useState('');
  const [tipoAtencion, setTipoAtencion] = useState('consulta');
  const [sedeId, setSedeId] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [numeroAutorizacion, setNumeroAutorizacion] = useState('');
  const [copago, setCopago] = useState('');
  const [medicoId, setMedicoId] = useState('');
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState(null);

  useEffect(() => {
    const principal = sedes.find((s) => s.esPrincipal) ?? sedes[0];
    if (principal && !sedeId) setSedeId(principal.id);
  }, [sedes, sedeId]);

  useEffect(() => {
    onPacienteSeleccionado?.(paciente);
    setCitaId('');
    if (!paciente) {
      setCitasHoy([]);
      return;
    }
    getCitasHoyDePaciente(paciente.id)
      .then((citas) => {
        const admisibles = citas.filter((c) => ['agendada', 'confirmada'].includes(c.estado));
        setCitasHoy(admisibles);
        if (admisibles.length === 1) {
          setCitaId(admisibles[0].id);
          setMedicoId(admisibles[0].medico.id);
        }
      })
      .catch(() => setCitasHoy([]));
  }, [paciente, onPacienteSeleccionado]);

  const buscarPacientes = useMemo(
    () => async (query) => {
      const esDocumento = /^\d+$/.test(query);
      const res = await listPacientes(esDocumento ? { documento: query, pageSize: 8 } : { search: query, pageSize: 8 });
      return res.data;
    },
    [],
  );

  const seleccionarCita = (id) => {
    setCitaId(id);
    const cita = citasHoy.find((c) => c.id === id);
    if (cita) setMedicoId(cita.medico.id);
  };

  const puedeContinuar = () => {
    if (paso === 0) return !!paciente;
    if (paso === 1) return !!tipoAtencion && !!sedeId;
    if (paso === 3) return !!medicoId;
    return true;
  };

  const confirmar = async () => {
    setGuardando(true);
    setError(null);
    try {
      const admision = await createAdmision({
        pacienteId: paciente.id,
        citaId: citaId || undefined,
        sedeId,
        medicoId,
        tipoAtencion,
        numeroAutorizacion,
        copago: copago === '' ? undefined : Number(copago),
        observaciones,
      });
      setExito(`${admision.paciente.nombres} ${admision.paciente.apellidos} quedó en lista de espera.`);
      setPaso(0);
      setPaciente(null);
      setCitaId('');
      setNumeroAutorizacion('');
      setCopago('');
      setObservaciones('');
      setMedicoId('');
      setTipoAtencion('consulta');
      onAdmitida?.(admision);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const medicoSeleccionado = medicos.find((m) => m.id === medicoId);
  const sedeSeleccionada = sedes.find((s) => s.id === sedeId);
  const citaSeleccionada = citasHoy.find((c) => c.id === citaId);

  return (
    <section className={`card ${styles.card}`}>
      <Stepper pasos={PASOS} actual={paso} />

      {exito && paso === 0 && !paciente && (
        <div className={styles.exito}>
          <span className="msr" style={{ fontSize: 18 }}>check_circle</span> {exito}
        </div>
      )}

      {paso === 0 && (
        <div>
          <h2 className={styles.titulo}>Verificación de Datos</h2>
          <div className="fieldLabel">Paciente <span className="required">*</span></div>
          <SearchSelect
            value={paciente}
            onChange={setPaciente}
            fetcher={buscarPacientes}
            getLabel={(p) => `${p.nombres} ${p.apellidos}`}
            getSublabel={(p) => `${p.tipoDocumento} ${formatDocumento(p.numeroDocumento)} · ${p.eps?.nombre ?? ''}`}
            placeholder="Buscar por nombre, apellido o documento…"
          />

          {paciente && (
            <>
              <div className={styles.datosGrid}>
                <div><div className={styles.datoLabel}>Documento</div><div className={styles.datoValor}>{paciente.tipoDocumento} {formatDocumento(paciente.numeroDocumento)}</div></div>
                <div><div className={styles.datoLabel}>Teléfono</div><div className={styles.datoValor}>{paciente.telefono}</div></div>
                <div><div className={styles.datoLabel}>EPS / Régimen</div><div className={styles.datoValor}>{paciente.eps?.nombre} · {labelDe(REGIMENES, paciente.regimen)}</div></div>
                <div><div className={styles.datoLabel}>Dirección</div><div className={styles.datoValor}>{paciente.direccion}, {paciente.municipio}</div></div>
              </div>
              <Link to={`/pacientes/${paciente.id}/editar`} className={styles.editarLink}>
                <span className="msr" style={{ fontSize: 15 }}>edit</span> Corregir datos del paciente
              </Link>

              <div className={styles.citasBloque}>
                <div className="fieldLabel">Origen de la admisión</div>
                <label className={styles.opcionCita}>
                  <input type="radio" name="cita" checked={citaId === ''} onChange={() => setCitaId('')} />
                  <span>Sin cita previa (walk-in)</span>
                </label>
                {citasHoy.map((cita) => (
                  <label key={cita.id} className={styles.opcionCita}>
                    <input type="radio" name="cita" checked={citaId === cita.id} onChange={() => seleccionarCita(cita.id)} />
                    <span>
                      Cita de hoy {formatHora(cita.inicio)} · {cita.medico.nombres} {cita.medico.apellidos}
                      {cita.motivo ? ` · ${cita.motivo}` : ''}
                    </span>
                  </label>
                ))}
                {citasHoy.length === 0 && (
                  <div className={styles.sinCitas}>El paciente no tiene citas admisibles hoy.</div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {paso === 1 && (
        <div>
          <h2 className={styles.titulo}>Tipo de Atención</h2>
          <div className={styles.grid2}>
            <div>
              <div className="fieldLabel">Tipo de Atención <span className="required">*</span></div>
              <select className="select" value={tipoAtencion} onChange={(e) => setTipoAtencion(e.target.value)}>
                {TIPOS_ATENCION.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <div className="fieldLabel">Sede <span className="required">*</span></div>
              <select className="select" value={sedeId} onChange={(e) => setSedeId(e.target.value)}>
                {sedes.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
            </div>
            <div className={styles.colSpan2}>
              <div className="fieldLabel">Observaciones</div>
              <input
                className="input"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Observaciones de la admisión (opcional)"
              />
            </div>
          </div>
        </div>
      )}

      {paso === 2 && (
        <div>
          <h2 className={styles.titulo}>Autorización de EPS</h2>
          <div className={styles.grid2}>
            <div>
              <div className="fieldLabel">No. de Autorización EPS</div>
              <input
                className="input"
                value={numeroAutorizacion}
                onChange={(e) => setNumeroAutorizacion(e.target.value)}
                placeholder="Ej. AUT-2026-004521"
              />
            </div>
            <div>
              <div className="fieldLabel">Copago</div>
              <input
                className="input"
                type="number"
                min="0"
                value={copago}
                onChange={(e) => setCopago(e.target.value)}
                placeholder="$ 0"
              />
            </div>
          </div>
          <div className={styles.ayuda}>Si la atención no requiere autorización de la EPS, deja el campo vacío (RF-ADM2-02).</div>
        </div>
      )}

      {paso === 3 && (
        <div>
          <h2 className={styles.titulo}>Asignación de Médico</h2>
          <div className="fieldLabel">Médico Asignado <span className="required">*</span></div>
          <select className="select" value={medicoId} onChange={(e) => setMedicoId(e.target.value)}>
            <option value="">Seleccionar…</option>
            {medicos.map((m) => (
              <option key={m.id} value={m.id}>{m.nombres} {m.apellidos} · {m.cargoProfesion}</option>
            ))}
          </select>
          {citaSeleccionada && (
            <div className={styles.ayuda}>Sugerido desde la cita: {citaSeleccionada.medico.nombres} {citaSeleccionada.medico.apellidos}.</div>
          )}
        </div>
      )}

      {paso === 4 && (
        <div>
          <h2 className={styles.titulo}>Confirmación</h2>
          <div className={styles.datosGrid}>
            <div><div className={styles.datoLabel}>Paciente</div><div className={styles.datoValor}>{paciente.nombres} {paciente.apellidos}</div></div>
            <div><div className={styles.datoLabel}>Tipo de Atención</div><div className={styles.datoValor}>{labelTipoAtencion(tipoAtencion)}</div></div>
            <div><div className={styles.datoLabel}>Origen</div><div className={styles.datoValor}>{citaSeleccionada ? `Cita ${formatHora(citaSeleccionada.inicio)}` : 'Walk-in'}</div></div>
            <div><div className={styles.datoLabel}>Médico</div><div className={styles.datoValor}>{medicoSeleccionado ? `${medicoSeleccionado.nombres} ${medicoSeleccionado.apellidos}` : '—'}</div></div>
            <div><div className={styles.datoLabel}>Sede</div><div className={styles.datoValor}>{sedeSeleccionada?.nombre}</div></div>
            <div><div className={styles.datoLabel}>Autorización EPS</div><div className={styles.datoValor}>{numeroAutorizacion || '—'}</div></div>
            <div><div className={styles.datoLabel}>Copago</div><div className={styles.datoValor}>{copago !== '' ? `$ ${Number(copago).toLocaleString('es-CO')}` : '—'}</div></div>
            <div><div className={styles.datoLabel}>Observaciones</div><div className={styles.datoValor}>{observaciones || '—'}</div></div>
          </div>
        </div>
      )}

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.footer}>
        {paso > 0 && (
          <button type="button" className="btn btnGhost" onClick={() => setPaso(paso - 1)} disabled={guardando}>
            Atrás
          </button>
        )}
        {paso < PASOS.length - 1 && (
          <button type="button" className="btn btnPrimary" onClick={() => setPaso(paso + 1)} disabled={!puedeContinuar()}>
            Continuar
          </button>
        )}
        {paso === PASOS.length - 1 && (
          <button type="button" className="btn btnPrimary" onClick={confirmar} disabled={guardando}>
            <span className="msr" style={{ fontSize: 17 }}>how_to_reg</span>
            {guardando ? 'Admitiendo…' : 'Confirmar Admisión'}
          </button>
        )}
      </div>
    </section>
  );
}
