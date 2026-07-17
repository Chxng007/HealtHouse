import { useEffect, useState } from 'react';
import { getConfiguracion, setConfiguracion } from '../api/configuracion.api';
import styles from '../styles/dashboard/ConfiguracionPage.module.css';

const IPS_DEFAULT = { nombre: 'HealthCore IPS', nit: '', direccion: '', telefono: '', codigoHabilitacion: '', sedePrincipal: 'Sede Principal' };
const GENERAL_DEFAULT = { zonaHoraria: 'America/Bogota', idioma: 'es-CO' };
const SEGURIDAD_DEFAULT = { bloqueoIntentos: true, forzarHttps: true, expiracionPassword: false, registroAuditoria: true };
const NOTIFICACIONES_DEFAULT = { recordatorioEmail: true, recordatorioSms: false, alertasGlosaCartera: true };
const BACKUP_DEFAULT = { frecuencia: 'Diaria, 2:00 a.m.', retencion: '30 días', ultimaCopia: null, estado: 'Exitosa' };

function Switch({ checked, onChange }) {
  return (
    <button type="button" className={styles.switch} onClick={() => onChange(!checked)} data-on={checked} aria-pressed={checked}>
      <span className={styles.switchKnob} />
    </button>
  );
}

function FilaToggle({ icon, label, sub, checked, onChange }) {
  return (
    <div className={styles.filaToggle}>
      <span className={`msr msr-outline ${styles.filaIcono}`}>{icon}</span>
      <div className={styles.filaTexto}>
        <div className={styles.filaLabel}>{label}</div>
        <div className={styles.filaSub}>{sub}</div>
      </div>
      <Switch checked={checked} onChange={onChange} />
    </div>
  );
}

export default function ConfiguracionPage() {
  const [ips, setIps] = useState(IPS_DEFAULT);
  const [general, setGeneral] = useState(GENERAL_DEFAULT);
  const [seguridad, setSeguridad] = useState(SEGURIDAD_DEFAULT);
  const [notificaciones, setNotificaciones] = useState(NOTIFICACIONES_DEFAULT);
  const [backup, setBackup] = useState(BACKUP_DEFAULT);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getConfiguracion('ips').then((c) => setIps({ ...IPS_DEFAULT, ...c.valor })).catch(() => {});
    getConfiguracion('general').then((c) => setGeneral({ ...GENERAL_DEFAULT, ...c.valor })).catch(() => {});
    getConfiguracion('seguridad').then((c) => setSeguridad({ ...SEGURIDAD_DEFAULT, ...c.valor })).catch(() => {});
    getConfiguracion('notificaciones').then((c) => setNotificaciones({ ...NOTIFICACIONES_DEFAULT, ...c.valor })).catch(() => {});
    getConfiguracion('backup').then((c) => setBackup({ ...BACKUP_DEFAULT, ...c.valor })).catch(() => {});
  }, []);

  const guardar = async () => {
    setGuardando(true);
    setError(null);
    setMensaje(null);
    try {
      await Promise.all([
        setConfiguracion('ips', ips),
        setConfiguracion('general', general),
        setConfiguracion('seguridad', seguridad),
        setConfiguracion('notificaciones', notificaciones),
      ]);
      setMensaje('Configuración guardada correctamente.');
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div className={styles.espaciador} />
        <button type="button" className="btn btnPrimary" onClick={guardar} disabled={guardando}>
          {guardando ? 'Guardando…' : 'Guardar Cambios'}
        </button>
      </div>

      {mensaje && <div className={styles.exito}>{mensaje}</div>}
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.grid2}>
        <section className="card" style={{ padding: '22px 24px' }}>
          <h2 className={styles.tituloSeccion}>Datos de la Institución</h2>
          <div className={styles.campos}>
            <div>
              <div className="fieldLabel">Nombre de la IPS</div>
              <input className="input" value={ips.nombre} onChange={(e) => setIps({ ...ips, nombre: e.target.value })} />
            </div>
            <div>
              <div className="fieldLabel">NIT</div>
              <input className="input" value={ips.nit} onChange={(e) => setIps({ ...ips, nit: e.target.value })} />
            </div>
            <div>
              <div className="fieldLabel">Dirección</div>
              <input className="input" value={ips.direccion} onChange={(e) => setIps({ ...ips, direccion: e.target.value })} />
            </div>
            <div className={styles.grid2Interno}>
              <div>
                <div className="fieldLabel">Zona Horaria</div>
                <select className="select" value={general.zonaHoraria} onChange={(e) => setGeneral({ ...general, zonaHoraria: e.target.value })}>
                  <option value="America/Bogota">América/Bogotá (GMT-5)</option>
                </select>
              </div>
              <div>
                <div className="fieldLabel">Idioma</div>
                <select className="select" value={general.idioma} onChange={(e) => setGeneral({ ...general, idioma: e.target.value })}>
                  <option value="es-CO">Español (Colombia)</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        <section className="card" style={{ padding: '22px 24px' }}>
          <h2 className={styles.tituloSeccion}>Seguridad</h2>
          <div className={styles.filas}>
            <FilaToggle icon="lock_clock" label="Bloqueo tras 5 intentos fallidos" sub="Bloquea la cuenta automáticamente" checked={seguridad.bloqueoIntentos} onChange={(v) => setSeguridad({ ...seguridad, bloqueoIntentos: v })} />
            <FilaToggle icon="https" label="Forzar HTTPS/TLS" sub="Cifrado obligatorio en toda comunicación" checked={seguridad.forzarHttps} onChange={(v) => setSeguridad({ ...seguridad, forzarHttps: v })} />
            <FilaToggle icon="password" label="Expiración de contraseña (90 días)" sub="Solicita cambio periódico de clave" checked={seguridad.expiracionPassword} onChange={(v) => setSeguridad({ ...seguridad, expiracionPassword: v })} />
            <FilaToggle icon="history" label="Registro de auditoría" sub="Guarda accesos, creaciones y cambios" checked={seguridad.registroAuditoria} onChange={(v) => setSeguridad({ ...seguridad, registroAuditoria: v })} />
          </div>
          <div className={styles.nota}>Nota: estas opciones se persisten para cuando se habilite el módulo de autenticación; hoy la plataforma no requiere inicio de sesión.</div>
        </section>

        <section className="card" style={{ padding: '22px 24px' }}>
          <h2 className={styles.tituloSeccion}>Notificaciones</h2>
          <div className={styles.filas}>
            <FilaToggle icon="mail" label="Recordatorio de citas por correo" sub="Se envía 24h antes de la cita" checked={notificaciones.recordatorioEmail} onChange={(v) => setNotificaciones({ ...notificaciones, recordatorioEmail: v })} />
            <FilaToggle icon="sms" label="Recordatorio de citas por SMS" sub="Se envía 2h antes de la cita" checked={notificaciones.recordatorioSms} onChange={(v) => setNotificaciones({ ...notificaciones, recordatorioSms: v })} />
            <FilaToggle icon="campaign" label="Alertas de glosas y cartera" sub="Notifica al equipo de facturación" checked={notificaciones.alertasGlosaCartera} onChange={(v) => setNotificaciones({ ...notificaciones, alertasGlosaCartera: v })} />
          </div>
          <div className={styles.nota}>Nota: el envío real (SMS/correo) queda como stub — ver `Recordatorio` en Agenda.</div>
        </section>

        <section className="card" style={{ padding: '22px 24px' }}>
          <h2 className={styles.tituloSeccion}>Copias de Seguridad</h2>
          <div className={styles.backupFilas}>
            <div className={styles.backupFila}><span>Frecuencia</span><strong>{backup.frecuencia}</strong></div>
            <div className={styles.backupFila}><span>Retención</span><strong>{backup.retencion}</strong></div>
            <div className={styles.backupFila}><span>Última Copia</span><strong>{backup.ultimaCopia ?? '—'}</strong></div>
            <div className={styles.backupFila}>
              <span>Estado</span>
              <span className={styles.badgeExitosa}>{backup.estado}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
