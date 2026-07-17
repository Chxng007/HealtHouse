import { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import { listAdmisiones } from '../../api/admisiones.api';
import { createAtencion } from '../../api/historiaClinica.api';
import { formatHora } from '../../utils/fechas';
import styles from '../../styles/historia-clinica/NuevaAtencionModal.module.css';

export default function NuevaAtencionModal({ open, paciente, sedes, medicos, onClose, onCreada }) {
  const [admisiones, setAdmisiones] = useState([]);
  const [admisionId, setAdmisionId] = useState('');
  const [medicoId, setMedicoId] = useState('');
  const [sedeId, setSedeId] = useState('');
  const [motivoConsulta, setMotivoConsulta] = useState('');
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!open || !paciente) return;
    setError(null);
    setMotivoConsulta('');
    setAdmisionId('');
    const principal = sedes.find((s) => s.esPrincipal) ?? sedes[0];
    setSedeId(principal?.id ?? '');
    setMedicoId('');
    listAdmisiones({ pacienteId: paciente.id })
      .then((res) => setAdmisiones(res.filter((a) => ['en_espera', 'en_atencion'].includes(a.estado) && !a.atencion)))
      .catch(() => setAdmisiones([]));
  }, [open, paciente, sedes]);

  const onSeleccionAdmision = (id) => {
    setAdmisionId(id);
    const admision = admisiones.find((a) => a.id === id);
    if (admision) {
      setMedicoId(admision.medico.id);
      setSedeId(admision.sede.id);
    }
  };

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      const atencion = await createAtencion({
        pacienteId: paciente.id,
        admisionId: admisionId || undefined,
        medicoId,
        sedeId,
        motivoConsulta,
      });
      onCreada(atencion);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  if (!paciente) return null;

  return (
    <Modal open={open} title="Nueva Atención" onClose={onClose} width={520}>
      <form onSubmit={guardar} className={styles.form}>
        <div className={styles.pacienteInfo}>
          Paciente: <strong>{paciente.nombres} {paciente.apellidos}</strong>
        </div>

        {admisiones.length > 0 && (
          <div>
            <div className="fieldLabel">Admisión Pendiente</div>
            <select className="select" value={admisionId} onChange={(e) => onSeleccionAdmision(e.target.value)}>
              <option value="">Atención directa (sin admisión)</option>
              {admisiones.map((a) => (
                <option key={a.id} value={a.id}>
                  {formatHora(a.horaLlegada)} · {a.medico.nombres} {a.medico.apellidos}
                </option>
              ))}
            </select>
          </div>
        )}

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
              {medicos.map((m) => (
                <option key={m.id} value={m.id}>{m.nombres} {m.apellidos} · {m.cargoProfesion}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <div className="fieldLabel">Motivo de Consulta <span className="required">*</span></div>
          <textarea
            className="input"
            style={{ resize: 'vertical', height: 70 }}
            value={motivoConsulta}
            onChange={(e) => setMotivoConsulta(e.target.value)}
            placeholder="Describe el motivo de la consulta…"
            required
            minLength={3}
          />
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.footer}>
          <button type="button" className="btn btnGhost" onClick={onClose} disabled={guardando}>Cancelar</button>
          <button type="submit" className="btn btnPrimary" disabled={guardando}>
            <span className="msr" style={{ fontSize: 18 }}>add</span>
            {guardando ? 'Creando…' : 'Iniciar Atención'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
