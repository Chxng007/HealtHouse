import { useEffect, useMemo, useState } from 'react';
import Modal from '../common/Modal';
import SearchSelect from '../common/SearchSelect';
import { createCita } from '../../api/agenda.api';
import { listPacientes } from '../../api/pacientes.api';
import { DURACIONES_CITA } from '../../constants/citas';
import { formatDocumento } from '../../utils/formato';
import { toISODateLocal } from '../../utils/fechas';
import styles from '../../styles/agenda/CitaFormModal.module.css';

export default function CitaFormModal({ open, fechaInicial, sedes, medicos, consultorios, onClose, onCreada }) {
  const [paciente, setPaciente] = useState(null);
  const [sedeId, setSedeId] = useState('');
  const [consultorioId, setConsultorioId] = useState('');
  const [medicoId, setMedicoId] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('08:00');
  const [duracion, setDuracion] = useState(30);
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!open) return;
    setPaciente(null);
    setError(null);
    setMotivo('');
    setDuracion(30);
    const base = fechaInicial ?? new Date();
    setFecha(toISODateLocal(base));
    setHora(`${String(base.getHours()).padStart(2, '0')}:${String(base.getMinutes()).padStart(2, '0')}`);
    const principal = sedes.find((s) => s.esPrincipal) ?? sedes[0];
    setSedeId(principal?.id ?? '');
    setConsultorioId('');
    setMedicoId('');
  }, [open, fechaInicial, sedes]);

  const consultoriosDeSede = useMemo(
    () => consultorios.filter((c) => c.sede.id === sedeId),
    [consultorios, sedeId],
  );

  const buscarPacientes = useMemo(
    () => async (query) => {
      const esDocumento = /^\d+$/.test(query);
      const res = await listPacientes(esDocumento ? { documento: query, pageSize: 8 } : { search: query, pageSize: 8 });
      return res.data;
    },
    [],
  );

  const onSeleccionConsultorio = (id) => {
    setConsultorioId(id);
    const consultorio = consultoriosDeSede.find((c) => c.id === id);
    if (consultorio?.medico && !medicoId) setMedicoId(consultorio.medico.id);
  };

  const guardar = async (e) => {
    e.preventDefault();
    if (!paciente) {
      setError('Selecciona un paciente.');
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      const inicio = new Date(`${fecha}T${hora}:00`);
      const fin = new Date(inicio.getTime() + duracion * 60000);
      const cita = await createCita({
        pacienteId: paciente.id,
        medicoId,
        consultorioId,
        sedeId,
        inicio: inicio.toISOString(),
        fin: fin.toISOString(),
        motivo,
      });
      onCreada(cita);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal open={open} title="Nueva Cita" onClose={onClose} width={560}>
      <form onSubmit={guardar} className={styles.form}>
        <div>
          <div className="fieldLabel">Paciente <span className="required">*</span></div>
          <SearchSelect
            value={paciente}
            onChange={setPaciente}
            fetcher={buscarPacientes}
            getLabel={(p) => `${p.nombres} ${p.apellidos}`}
            getSublabel={(p) => `${p.tipoDocumento} ${formatDocumento(p.numeroDocumento)} · ${p.eps?.nombre ?? ''}`}
            placeholder="Nombre, apellido o documento…"
          />
        </div>

        <div className={styles.grid2}>
          <div>
            <div className="fieldLabel">Sede <span className="required">*</span></div>
            <select
              className="select"
              value={sedeId}
              onChange={(e) => {
                setSedeId(e.target.value);
                setConsultorioId('');
              }}
              required
            >
              {sedes.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
          </div>
          <div>
            <div className="fieldLabel">Consultorio <span className="required">*</span></div>
            <select className="select" value={consultorioId} onChange={(e) => onSeleccionConsultorio(e.target.value)} required>
              <option value="">Seleccionar…</option>
              {consultoriosDeSede.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}{c.especialidad ? ` · ${c.especialidad.nombre}` : ''}
                </option>
              ))}
            </select>
          </div>
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

        <div className={styles.grid3}>
          <div>
            <div className="fieldLabel">Fecha <span className="required">*</span></div>
            <input className="input" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
          </div>
          <div>
            <div className="fieldLabel">Hora <span className="required">*</span></div>
            <input className="input" type="time" value={hora} onChange={(e) => setHora(e.target.value)} required />
          </div>
          <div>
            <div className="fieldLabel">Duración</div>
            <select className="select" value={duracion} onChange={(e) => setDuracion(Number(e.target.value))}>
              {DURACIONES_CITA.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <div className="fieldLabel">Motivo</div>
          <input
            className="input"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Motivo de la consulta"
          />
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.footer}>
          <button type="button" className="btn btnGhost" onClick={onClose} disabled={guardando}>Cancelar</button>
          <button type="submit" className="btn btnPrimary" disabled={guardando}>
            <span className="msr" style={{ fontSize: 18 }}>event</span>
            {guardando ? 'Agendando…' : 'Agendar Cita'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
