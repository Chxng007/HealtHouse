import { useEffect, useState } from 'react';
import DocumentoHistorialList from './DocumentoHistorialList';
import AnularDocumentoModal from './AnularDocumentoModal';
import PrintLayout from '../common/PrintLayout';
import { formatDocumento } from '../../utils/formato';
import styles from '../../styles/formulas-ordenes/DocumentoTab.module.css';

function mensajeError(err) {
  if (err.detalles) {
    const primero = Object.values(err.detalles).flat()[0];
    if (primero) return primero;
  }
  return err.message;
}

export default function DocumentoTab({
  paciente,
  medicos,
  sedes,
  sedeDefaultId,
  tipoLabel,
  listFn,
  createFn,
  anularFn,
  estadoDe,
  puedeAnular,
  renderResumen,
  renderMeta,
  camposIniciales,
  renderCampos,
  payloadDeCampos,
  renderPreview,
}) {
  const [medicoId, setMedicoId] = useState('');
  const [sedeId, setSedeId] = useState(sedeDefaultId ?? '');
  const [campos, setCampos] = useState(camposIniciales());
  const [documentos, setDocumentos] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [confirmAnular, setConfirmAnular] = useState(null);
  const [anulando, setAnulando] = useState(false);

  useEffect(() => {
    setSeleccionado(null);
    setError(null);
    listFn(paciente.id).then(setDocumentos).catch((err) => setError(err.message));
  }, [paciente.id, listFn]);

  useEffect(() => {
    setSedeId(sedeDefaultId ?? '');
  }, [sedeDefaultId]);

  const generar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      const doc = await createFn({ pacienteId: paciente.id, medicoId, sedeId, ...payloadDeCampos(campos) });
      setDocumentos((prev) => [doc, ...prev]);
      setSeleccionado(doc);
      setCampos(camposIniciales());
    } catch (err) {
      setError(mensajeError(err));
    } finally {
      setGuardando(false);
    }
  };

  const confirmarAnular = async (motivo) => {
    setAnulando(true);
    try {
      const doc = await anularFn(confirmAnular.id, motivo);
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

          {renderCampos({ campos, setCampos })}

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.footer}>
            <button type="submit" className="btn btnPrimary" disabled={guardando || !medicoId || !sedeId}>
              <span className="msr" style={{ fontSize: 17 }}>print</span>
              {guardando ? 'Generando…' : 'Generar Documento'}
            </button>
          </div>
        </form>

        <h3 className={styles.historialTitulo}>Historial de {tipoLabel}</h3>
        <DocumentoHistorialList
          documentos={documentos}
          seleccionadoId={seleccionado?.id}
          estadoDe={estadoDe}
          renderResumen={renderResumen}
          renderMeta={renderMeta}
          onSeleccionar={setSeleccionado}
          onAnular={setConfirmAnular}
          puedeAnular={puedeAnular}
        />
      </section>

      <section className={`card ${styles.previewCard}`}>
        <div className={styles.previewHeader}>
          <span className="msr" style={{ fontSize: 18, color: 'var(--color-primary)' }}>visibility</span>
          <div className={styles.previewTitulo}>Vista Previa Imprimible</div>
        </div>
        {!seleccionado && <div className={styles.previewVacio}>Genera o selecciona un documento del historial para ver la vista previa.</div>}
        {seleccionado && (
          <>
            <PrintLayout
              titulo={tipoLabel}
              paciente={`${seleccionado.paciente.nombres} ${seleccionado.paciente.apellidos}`}
              documento={`${seleccionado.paciente.tipoDocumento} ${formatDocumento(seleccionado.paciente.numeroDocumento)}`}
              medico={`${seleccionado.medico.nombres} ${seleccionado.medico.apellidos} · ${seleccionado.medico.cargoProfesion}`}
              fecha={seleccionado.fecha}
            >
              {renderPreview(seleccionado)}
            </PrintLayout>
            <button type="button" className={`btn btnGhost ${styles.imprimirBtn}`} onClick={() => window.print()}>
              <span className="msr" style={{ fontSize: 17 }}>print</span> Imprimir
            </button>
          </>
        )}
      </section>

      <AnularDocumentoModal
        open={!!confirmAnular}
        tipoLabel={tipoLabel}
        loading={anulando}
        onConfirm={confirmarAnular}
        onCancel={() => setConfirmAnular(null)}
      />
    </div>
  );
}
