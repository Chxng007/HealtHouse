import { useEffect, useState } from 'react';
import DocumentoHistorialList from './DocumentoHistorialList';
import AnularDocumentoModal from './AnularDocumentoModal';
import SignaturePad from './SignaturePad';
import PrintLayout from '../common/PrintLayout';
import {
  anularConsentimiento,
  createConsentimiento,
  firmarConsentimiento,
  listConsentimientos,
} from '../../api/formulasOrdenes.api';
import { estadoConsentimiento } from '../../constants/formulasOrdenes';
import { formatDocumento } from '../../utils/formato';
import styles from '../../styles/formulas-ordenes/DocumentoTab.module.css';

export default function ConsentimientoTab({ paciente, medicos, sedes, sedeDefaultId }) {
  const [medicoId, setMedicoId] = useState('');
  const [sedeId, setSedeId] = useState(sedeDefaultId ?? '');
  const [procedimiento, setProcedimiento] = useState('');
  const [firmante, setFirmante] = useState('Paciente');
  const [documentos, setDocumentos] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [firmando, setFirmando] = useState(false);
  const [confirmAnular, setConfirmAnular] = useState(null);
  const [anulando, setAnulando] = useState(false);

  useEffect(() => {
    setSeleccionado(null);
    setError(null);
    listConsentimientos(paciente.id).then(setDocumentos).catch((err) => setError(err.message));
  }, [paciente.id]);

  useEffect(() => setSedeId(sedeDefaultId ?? ''), [sedeDefaultId]);

  const generar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      const doc = await createConsentimiento({ pacienteId: paciente.id, medicoId, sedeId, procedimiento, firmante });
      setDocumentos((prev) => [doc, ...prev]);
      setSeleccionado(doc);
      setProcedimiento('');
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const firmar = async (blob) => {
    setFirmando(true);
    setError(null);
    try {
      const doc = await firmarConsentimiento(seleccionado.id, blob);
      setDocumentos((prev) => prev.map((d) => (d.id === doc.id ? doc : d)));
      setSeleccionado(doc);
    } catch (err) {
      setError(err.message);
    } finally {
      setFirmando(false);
    }
  };

  const confirmarAnular = async (motivo) => {
    setAnulando(true);
    try {
      const doc = await anularConsentimiento(confirmAnular.id, motivo);
      setDocumentos((prev) => prev.map((d) => (d.id === doc.id ? doc : d)));
      setSeleccionado((s) => (s?.id === doc.id ? doc : s));
      setConfirmAnular(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setAnulando(false);
    }
  };

  return (
    <div className={styles.grid}>
      <section className={`card ${styles.formCard}`}>
        <div className={styles.pacienteInfo}>
          <div className={styles.pacienteNombre}>{paciente.nombres} {paciente.apellidos}</div>
          <div className={styles.pacienteSub}>{paciente.tipoDocumento} {formatDocumento(paciente.numeroDocumento)} · {paciente.eps?.nombre}</div>
        </div>

        <form onSubmit={generar} className={styles.form}>
          <div className={styles.grid2}>
            <div>
              <div className="fieldLabel">Sede <span className="required">*</span></div>
              <select className="select" value={sedeId} onChange={(e) => setSedeId(e.target.value)} required>
                {sedes.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
            </div>
            <div>
              <div className="fieldLabel">Médico <span className="required">*</span></div>
              <select className="select" value={medicoId} onChange={(e) => setMedicoId(e.target.value)} required>
                <option value="">Seleccionar…</option>
                {medicos.map((m) => <option key={m.id} value={m.id}>{m.nombres} {m.apellidos} · {m.cargoProfesion}</option>)}
              </select>
            </div>
          </div>
          <div>
            <div className="fieldLabel">Procedimiento <span className="required">*</span></div>
            <input className="input" value={procedimiento} onChange={(e) => setProcedimiento(e.target.value)} required minLength={3} />
          </div>
          <div>
            <div className="fieldLabel">Firmado por</div>
            <select className="select" value={firmante} onChange={(e) => setFirmante(e.target.value)}>
              <option value="Paciente">Paciente</option>
              <option value="Acudiente">Acudiente</option>
            </select>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.footer}>
            <button type="submit" className="btn btnPrimary" disabled={guardando || !medicoId || !sedeId}>
              <span className="msr" style={{ fontSize: 17 }}>description</span>
              {guardando ? 'Creando…' : 'Crear Consentimiento'}
            </button>
          </div>
        </form>

        {seleccionado?.estado === 'pendiente' && (
          <div className={styles.firmaBox}>
            <div className="fieldLabel">Capturar Firma</div>
            <SignaturePad onGuardar={firmar} guardando={firmando} />
          </div>
        )}

        <h3 className={styles.historialTitulo}>Historial de Consentimientos</h3>
        <DocumentoHistorialList
          documentos={documentos}
          seleccionadoId={seleccionado?.id}
          estadoDe={(doc) => estadoConsentimiento(doc.estado)}
          renderResumen={(doc) => doc.procedimiento}
          renderMeta={(doc) => `Firmado por: ${doc.firmante}`}
          onSeleccionar={setSeleccionado}
          onAnular={setConfirmAnular}
          puedeAnular={(doc) => doc.estado !== 'anulado'}
        />
      </section>

      <section className={`card ${styles.previewCard}`}>
        <div className={styles.previewHeader}>
          <span className="msr" style={{ fontSize: 18, color: 'var(--color-primary)' }}>visibility</span>
          <div className={styles.previewTitulo}>Vista Previa Imprimible</div>
        </div>
        {!seleccionado && <div className={styles.previewVacio}>Crea o selecciona un consentimiento del historial para ver la vista previa.</div>}
        {seleccionado && (
          <>
            <PrintLayout
              titulo="Consentimiento Informado"
              paciente={`${seleccionado.paciente.nombres} ${seleccionado.paciente.apellidos}`}
              documento={`${seleccionado.paciente.tipoDocumento} ${formatDocumento(seleccionado.paciente.numeroDocumento)}`}
              medico={`${seleccionado.medico.nombres} ${seleccionado.medico.apellidos} · ${seleccionado.medico.cargoProfesion}`}
              fecha={seleccionado.fecha}
            >
              <div>Procedimiento: {seleccionado.procedimiento}</div>
              <div>Firmado por: {seleccionado.firmante}</div>
              <div>Estado: {estadoConsentimiento(seleccionado.estado).label}</div>
              {seleccionado.firmaUrl && (
                <img src={seleccionado.firmaUrl} alt="Firma" style={{ maxWidth: 220, marginTop: 10, borderBottom: '1px solid #94a3b8' }} />
              )}
            </PrintLayout>
            <button type="button" className={`btn btnGhost ${styles.imprimirBtn}`} onClick={() => window.print()}>
              <span className="msr" style={{ fontSize: 17 }}>print</span> Imprimir
            </button>
          </>
        )}
      </section>

      <AnularDocumentoModal
        open={!!confirmAnular}
        tipoLabel="Consentimiento"
        loading={anulando}
        onConfirm={confirmarAnular}
        onCancel={() => setConfirmAnular(null)}
      />
    </div>
  );
}
