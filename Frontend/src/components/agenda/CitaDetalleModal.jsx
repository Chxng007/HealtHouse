import { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import EstadoBadge from '../common/EstadoBadge';
import { reprogramarCita, setEstadoCita } from '../../api/agenda.api';
import { ACCIONES_POR_ESTADO, DURACIONES_CITA, LABEL_ACCION, labelEstadoCita } from '../../constants/citas';
import { formatDocumento } from '../../utils/formato';
import { formatHora, labelDia, toISODateLocal } from '../../utils/fechas';
import styles from '../../styles/agenda/CitaDetalleModal.module.css';

const BADGE_VARIANT = {
  agendada: 'neutral',
  confirmada: 'primary',
  en_atencion: 'warning',
  atendida: 'success',
  cancelada: 'danger',
  no_asistio: 'neutral',
};

export default function CitaDetalleModal({ cita, onClose, onActualizada }) {
  const [modo, setModo] = useState('detalle'); // detalle | cancelar | reprogramar
  const [motivoCancelacion, setMotivoCancelacion] = useState('');
  const [nuevaFecha, setNuevaFecha] = useState('');
  const [nuevaHora, setNuevaHora] = useState('08:00');
  const [duracion, setDuracion] = useState(30);
  const [motivoReprogramacion, setMotivoReprogramacion] = useState('');
  const [error, setError] = useState(null);
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    if (!cita) return;
    setModo('detalle');
    setError(null);
    setMotivoCancelacion('');
    setMotivoReprogramacion('');
    const inicio = new Date(cita.inicio);
    setNuevaFecha(toISODateLocal(inicio));
    setNuevaHora(`${String(inicio.getHours()).padStart(2, '0')}:${String(inicio.getMinutes()).padStart(2, '0')}`);
    setDuracion(Math.round((new Date(cita.fin) - inicio) / 60000));
  }, [cita]);

  if (!cita) return null;

  const ejecutar = async (fn) => {
    setProcesando(true);
    setError(null);
    try {
      const actualizada = await fn();
      onActualizada(actualizada);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(false);
    }
  };

  const cambiarEstado = (estado) => {
    if (estado === 'cancelada') {
      setModo('cancelar');
      return;
    }
    ejecutar(() => setEstadoCita(cita.id, estado));
  };

  const confirmarCancelacion = () =>
    ejecutar(() => setEstadoCita(cita.id, 'cancelada', motivoCancelacion));

  const confirmarReprogramacion = () => {
    const inicio = new Date(`${nuevaFecha}T${nuevaHora}:00`);
    const fin = new Date(inicio.getTime() + duracion * 60000);
    return ejecutar(() =>
      reprogramarCita(cita.id, {
        inicio: inicio.toISOString(),
        fin: fin.toISOString(),
        motivoReprogramacion,
      }),
    );
  };

  const acciones = ACCIONES_POR_ESTADO[cita.estado] ?? [];
  const puedeReprogramar = !['atendida', 'cancelada', 'no_asistio'].includes(cita.estado);

  return (
    <Modal open title="Detalle de la Cita" onClose={onClose} width={520}>
      <div className={styles.contenido}>
        <div className={styles.encabezado}>
          <div>
            <div className={styles.paciente}>{cita.paciente.nombres} {cita.paciente.apellidos}</div>
            <div className={styles.documento}>
              {formatDocumento(cita.paciente.numeroDocumento)} · Tel. {cita.paciente.telefono}
            </div>
          </div>
          <EstadoBadge variant={BADGE_VARIANT[cita.estado]}>{labelEstadoCita(cita.estado)}</EstadoBadge>
        </div>

        <div className={styles.grid}>
          <div>
            <div className={styles.campoLabel}>Fecha y Hora</div>
            <div className={styles.campoValor}>{labelDia(new Date(cita.inicio))}</div>
            <div className={styles.campoValor}>{formatHora(cita.inicio)} – {formatHora(cita.fin)}</div>
          </div>
          <div>
            <div className={styles.campoLabel}>Médico</div>
            <div className={styles.campoValor}>{cita.medico.nombres} {cita.medico.apellidos}</div>
            <div className={styles.campoSub}>{cita.medico.cargoProfesion}</div>
          </div>
          <div>
            <div className={styles.campoLabel}>Lugar</div>
            <div className={styles.campoValor}>{cita.consultorio.nombre}</div>
            <div className={styles.campoSub}>{cita.sede.nombre}</div>
          </div>
          <div>
            <div className={styles.campoLabel}>Motivo</div>
            <div className={styles.campoValor}>{cita.motivo ?? '—'}</div>
          </div>
        </div>

        {cita.motivoCancelacion && (
          <div className={styles.notaCancelacion}>Cancelada: {cita.motivoCancelacion}</div>
        )}
        {cita.motivoReprogramacion && (
          <div className={styles.notaReprogramacion}>Reprogramada: {cita.motivoReprogramacion}</div>
        )}

        {modo === 'cancelar' && (
          <div className={styles.formInline}>
            <div className="fieldLabel">Motivo de la cancelación <span className="required">*</span></div>
            <input
              className="input"
              value={motivoCancelacion}
              onChange={(e) => setMotivoCancelacion(e.target.value)}
              placeholder="¿Por qué se cancela la cita?"
            />
            <div className={styles.accionesInline}>
              <button type="button" className="btn btnGhost" onClick={() => setModo('detalle')} disabled={procesando}>Volver</button>
              <button
                type="button"
                className="btn btnDanger"
                onClick={confirmarCancelacion}
                disabled={procesando || motivoCancelacion.trim().length === 0}
              >
                {procesando ? 'Cancelando…' : 'Confirmar Cancelación'}
              </button>
            </div>
          </div>
        )}

        {modo === 'reprogramar' && (
          <div className={styles.formInline}>
            <div className={styles.gridReprogramar}>
              <div>
                <div className="fieldLabel">Nueva fecha</div>
                <input className="input" type="date" value={nuevaFecha} onChange={(e) => setNuevaFecha(e.target.value)} />
              </div>
              <div>
                <div className="fieldLabel">Hora</div>
                <input className="input" type="time" value={nuevaHora} onChange={(e) => setNuevaHora(e.target.value)} />
              </div>
              <div>
                <div className="fieldLabel">Duración</div>
                <select className="select" value={duracion} onChange={(e) => setDuracion(Number(e.target.value))}>
                  {DURACIONES_CITA.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
            </div>
            <div className="fieldLabel">Motivo de la reprogramación <span className="required">*</span></div>
            <input
              className="input"
              value={motivoReprogramacion}
              onChange={(e) => setMotivoReprogramacion(e.target.value)}
              placeholder="¿Por qué se reprograma?"
            />
            <div className={styles.accionesInline}>
              <button type="button" className="btn btnGhost" onClick={() => setModo('detalle')} disabled={procesando}>Volver</button>
              <button
                type="button"
                className="btn btnPrimary"
                onClick={confirmarReprogramacion}
                disabled={procesando || motivoReprogramacion.trim().length < 3}
              >
                {procesando ? 'Reprogramando…' : 'Confirmar Reprogramación'}
              </button>
            </div>
          </div>
        )}

        {error && <div className={styles.error}>{error}</div>}

        {modo === 'detalle' && (acciones.length > 0 || puedeReprogramar) && (
          <div className={styles.acciones}>
            {puedeReprogramar && (
              <button type="button" className="btn btnGhost" onClick={() => setModo('reprogramar')} disabled={procesando}>
                <span className="msr" style={{ fontSize: 17 }}>update</span> Reprogramar
              </button>
            )}
            {acciones.map((estado) => (
              <button
                key={estado}
                type="button"
                className={`btn ${estado === 'cancelada' ? 'btnDanger' : 'btnPrimary'}`}
                onClick={() => cambiarEstado(estado)}
                disabled={procesando}
              >
                {LABEL_ACCION[estado]}
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
