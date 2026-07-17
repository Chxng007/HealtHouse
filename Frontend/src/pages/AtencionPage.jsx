import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EstadoBadge from '../components/common/EstadoBadge';
import PacienteAvatar from '../components/pacientes/PacienteAvatar';
import SignosVitalesGrid from '../components/historia-clinica/SignosVitalesGrid';
import DiagnosticosSection from '../components/historia-clinica/DiagnosticosSection';
import TrazabilidadPanel from '../components/historia-clinica/TrazabilidadPanel';
import AnularAtencionModal from '../components/historia-clinica/AnularAtencionModal';
import {
  anularAtencion,
  cerrarAtencion,
  getAtencion,
  getTrazabilidadAtencion,
  updateAtencion,
} from '../api/historiaClinica.api';
import { estadoAtencion } from '../constants/hce';
import { edadDe } from '../constants/pacientes';
import { formatDocumento, formatFecha } from '../utils/formato';
import styles from '../styles/historia-clinica/AtencionPage.module.css';

const SIGNOS_VACIOS = { taSistolica: null, taDiastolica: null, fc: null, fr: null, temperatura: null, peso: null, talla: null, spo2: null };

function aCampos(atencion) {
  return {
    motivoConsulta: atencion.motivoConsulta ?? '',
    enfermedadActual: atencion.enfermedadActual ?? '',
    antecedentesPersonales: atencion.antecedentesPersonales ?? '',
    antecedentesFamiliares: atencion.antecedentesFamiliares ?? '',
    antecedentesFarmacologicos: atencion.antecedentesFarmacologicos ?? '',
    examenFisico: atencion.examenFisico ?? '',
    planManejo: atencion.planManejo ?? '',
    signosVitales: { ...SIGNOS_VACIOS, ...(atencion.signosVitales ?? {}) },
    diagnosticos: (atencion.diagnosticos ?? []).map((d) => ({ cie10Id: d.cie10Id, cie10: d.cie10, tipo: d.tipo, condicion: d.condicion })),
  };
}

export default function AtencionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [atencion, setAtencion] = useState(null);
  const [campos, setCampos] = useState(null);
  const [trazas, setTrazas] = useState([]);
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [cerrando, setCerrando] = useState(false);
  const [anulando, setAnulando] = useState(false);
  const [confirmCerrar, setConfirmCerrar] = useState(false);
  const [modalAnular, setModalAnular] = useState(false);

  const cargar = useCallback(() => {
    getAtencion(id).then((a) => {
      setAtencion(a);
      setCampos(aCampos(a));
    }).catch((err) => setError(err.message));
    getTrazabilidadAtencion(id).then(setTrazas).catch(() => setTrazas([]));
  }, [id]);

  useEffect(cargar, [cargar]);

  if (error) return <div className={styles.error}>{error}</div>;
  if (!atencion || !campos) return <div className={styles.cargando}>Cargando atención…</div>;

  const enCurso = atencion.estado === 'en_curso';
  const e = estadoAtencion(atencion.estado);

  const setCampo = (key, value) => setCampos((c) => ({ ...c, [key]: value }));
  const setSigno = (key, value) => setCampos((c) => ({ ...c, signosVitales: { ...c.signosVitales, [key]: value } }));

  const payload = () => ({
    motivoConsulta: campos.motivoConsulta,
    enfermedadActual: campos.enfermedadActual,
    antecedentesPersonales: campos.antecedentesPersonales,
    antecedentesFamiliares: campos.antecedentesFamiliares,
    antecedentesFarmacologicos: campos.antecedentesFarmacologicos,
    examenFisico: campos.examenFisico,
    planManejo: campos.planManejo,
    signosVitales: campos.signosVitales,
    diagnosticos: campos.diagnosticos.map((d) => ({ cie10Id: d.cie10Id, tipo: d.tipo, condicion: d.condicion })),
  });

  const guardar = async () => {
    setGuardando(true);
    setError(null);
    try {
      const actualizada = await updateAtencion(id, payload());
      setAtencion(actualizada);
      setCampos(aCampos(actualizada));
      getTrazabilidadAtencion(id).then(setTrazas).catch(() => {});
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setGuardando(false);
    }
  };

  const cerrar = async () => {
    setCerrando(true);
    try {
      const guardadoOk = await guardar();
      if (!guardadoOk) return;
      const cerrada = await cerrarAtencion(id);
      setAtencion(cerrada);
      setCampos(aCampos(cerrada));
      setConfirmCerrar(false);
      getTrazabilidadAtencion(id).then(setTrazas).catch(() => {});
    } catch (err) {
      setError(err.message);
    } finally {
      setCerrando(false);
    }
  };

  const anular = async (motivo) => {
    setAnulando(true);
    try {
      const anulada = await anularAtencion(id, motivo);
      setAtencion(anulada);
      setCampos(aCampos(anulada));
      setModalAnular(false);
      getTrazabilidadAtencion(id).then(setTrazas).catch(() => {});
    } catch (err) {
      setError(err.message);
    } finally {
      setAnulando(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={`card ${styles.banda}`}>
        <button type="button" className={styles.volverBtn} onClick={() => navigate('/historia-clinica')} title="Volver">
          <span className="msr" style={{ fontSize: 20 }}>arrow_back</span>
        </button>
        <PacienteAvatar paciente={atencion.paciente} size={48} />
        <div className={styles.pacienteInfo}>
          <div className={styles.pacienteNombre}>{atencion.paciente.nombres} {atencion.paciente.apellidos}</div>
          <div className={styles.pacienteMeta}>
            {atencion.paciente.tipoDocumento} {formatDocumento(atencion.paciente.numeroDocumento)} · {edadDe(atencion.paciente.fechaNacimiento)} años · {atencion.paciente.eps?.nombre}
          </div>
        </div>
        <EstadoBadge variant={e.badge}>{e.label}</EstadoBadge>
        {enCurso && (
          <button type="button" className="btn btnPrimary" onClick={guardar} disabled={guardando}>
            <span className="msr" style={{ fontSize: 17 }}>save</span>
            {guardando ? 'Guardando…' : 'Guardar Atención'}
          </button>
        )}
      </div>

      {atencion.estado === 'anulada' && (
        <div className={styles.bannerAnulada}>
          <span className="msr" style={{ fontSize: 19 }}>block</span>
          <div>
            <strong>Atención anulada.</strong> Motivo: {atencion.anuladaMotivo} ({formatFecha(atencion.anuladaAt)})
          </div>
        </div>
      )}
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.main}>
        <div className={styles.columnaPrincipal}>
          <section className={`card ${styles.seccion}`}>
            <h2 className="sectionTitle">Motivo de Consulta y Anamnesis</h2>
            <div className="fieldLabel">Motivo de Consulta</div>
            <textarea
              className="input"
              style={{ resize: 'vertical', height: 52 }}
              value={campos.motivoConsulta}
              onChange={(e) => setCampo('motivoConsulta', e.target.value)}
              disabled={!enCurso}
            />
            <div className="fieldLabel" style={{ marginTop: 14 }}>Enfermedad Actual</div>
            <textarea
              className="input"
              style={{ resize: 'vertical', height: 70 }}
              value={campos.enfermedadActual}
              onChange={(e) => setCampo('enfermedadActual', e.target.value)}
              disabled={!enCurso}
            />
            <div className={styles.grid3} style={{ marginTop: 14 }}>
              <div>
                <div className="fieldLabel">Antecedentes Personales</div>
                <textarea
                  className="input"
                  style={{ resize: 'vertical', height: 70 }}
                  value={campos.antecedentesPersonales}
                  onChange={(e) => setCampo('antecedentesPersonales', e.target.value)}
                  disabled={!enCurso}
                />
              </div>
              <div>
                <div className="fieldLabel">Antecedentes Familiares</div>
                <textarea
                  className="input"
                  style={{ resize: 'vertical', height: 70 }}
                  value={campos.antecedentesFamiliares}
                  onChange={(e) => setCampo('antecedentesFamiliares', e.target.value)}
                  disabled={!enCurso}
                />
              </div>
              <div>
                <div className="fieldLabel">Antecedentes Farmacológicos</div>
                <textarea
                  className="input"
                  style={{ resize: 'vertical', height: 70 }}
                  value={campos.antecedentesFarmacologicos}
                  onChange={(e) => setCampo('antecedentesFarmacologicos', e.target.value)}
                  disabled={!enCurso}
                />
              </div>
            </div>
          </section>

          <section className={`card ${styles.seccion}`}>
            <h2 className="sectionTitle">Signos Vitales</h2>
            <SignosVitalesGrid value={campos.signosVitales} onChange={setSigno} disabled={!enCurso} />
          </section>

          <section className={`card ${styles.seccion}`}>
            <h2 className="sectionTitle">Examen Físico</h2>
            <textarea
              className="input"
              style={{ resize: 'vertical', height: 80 }}
              value={campos.examenFisico}
              onChange={(e) => setCampo('examenFisico', e.target.value)}
              disabled={!enCurso}
            />
          </section>

          <DiagnosticosSection
            diagnosticos={campos.diagnosticos}
            onChange={(diagnosticos) => setCampos((c) => ({ ...c, diagnosticos }))}
            disabled={!enCurso}
          />

          <section className={`card ${styles.seccion}`}>
            <h2 className="sectionTitle">Plan de Manejo</h2>
            <textarea
              className="input"
              style={{ resize: 'vertical', height: 70 }}
              value={campos.planManejo}
              onChange={(e) => setCampo('planManejo', e.target.value)}
              disabled={!enCurso}
            />
          </section>

          {enCurso && (
            <div className={styles.accionesFinales}>
              <button type="button" className="btn btnGhost" onClick={() => setModalAnular(true)}>
                <span className="msr" style={{ fontSize: 17 }}>block</span> Anular
              </button>
              <button type="button" className="btn btnPrimary" onClick={() => setConfirmCerrar(true)} disabled={cerrando}>
                <span className="msr" style={{ fontSize: 17 }}>check_circle</span> Cerrar Atención
              </button>
            </div>
          )}
          {atencion.estado === 'cerrada' && (
            <div className={styles.accionesFinales}>
              <button type="button" className="btn btnGhost" onClick={() => setModalAnular(true)}>
                <span className="msr" style={{ fontSize: 17 }}>block</span> Anular
              </button>
            </div>
          )}
        </div>

        <TrazabilidadPanel trazas={trazas} />
      </div>

      <ConfirmDialog
        open={confirmCerrar}
        title="Cerrar Atención"
        message="Al cerrar la atención quedará en solo lectura y no podrá editarse; solo podrá anularse con justificación. ¿Deseas continuar?"
        confirmLabel="Cerrar Atención"
        loading={cerrando}
        onConfirm={cerrar}
        onCancel={() => setConfirmCerrar(false)}
      />

      <AnularAtencionModal
        open={modalAnular}
        loading={anulando}
        onConfirm={anular}
        onCancel={() => setModalAnular(false)}
      />
    </div>
  );
}
