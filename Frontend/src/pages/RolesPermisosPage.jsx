import { useEffect, useState } from 'react';
import { getRoles, getPermisosRol, setPermisosRol } from '../api/roles.api';
import { PERMISOS_MODULOS, PERMISOS_HEADERS } from '../constants/permisosModulos';
import styles from '../styles/users/RolesPermisosPage.module.css';

const CAMPOS = ['ver', 'crear', 'editar', 'eliminar', 'imprimir', 'exportar'];

export default function RolesPermisosPage() {
  const [roles, setRoles] = useState([]);
  const [rolActivoId, setRolActivoId] = useState('');
  const [matriz, setMatriz] = useState([]);
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    getRoles().then((res) => {
      setRoles(res);
      setRolActivoId(res[0]?.id ?? '');
    }).catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!rolActivoId) return;
    getPermisosRol(rolActivoId).then(setMatriz).catch((err) => setError(err.message));
  }, [rolActivoId]);

  const rolActivo = roles.find((r) => r.id === rolActivoId);

  const toggle = (modulo, campo, valor) => {
    setMatriz((prev) => prev.map((p) => (p.modulo === modulo ? { ...p, [campo]: valor } : p)));
    setGuardado(false);
  };

  const guardar = async () => {
    setGuardando(true);
    setError(null);
    try {
      const actualizada = await setPermisosRol(rolActivoId, matriz);
      setMatriz(actualizada);
      setGuardado(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.rolesGrid}>
        {roles.map((r) => (
          <button
            key={r.id}
            type="button"
            className={`${styles.rolCard} ${r.id === rolActivoId ? styles.rolCardActivo : ''}`}
            onClick={() => setRolActivoId(r.id)}
          >
            <div className={styles.rolHeader}>
              <span className={styles.rolIcono} style={{ background: r.color }}>
                <span className="msr" style={{ fontSize: 18, color: '#fff' }}>{r.icono}</span>
              </span>
              <span className={styles.rolLabel}>{r.nombre}</span>
            </div>
            <div className={styles.rolCount}>{r._count?.users ?? 0} usuarios</div>
          </button>
        ))}
      </div>

      <section className="card">
        <div className={styles.matrizHeader}>
          <div>
            <div className={styles.matrizTitulo}>Matriz de Permisos — {rolActivo?.nombre}</div>
            <div className={styles.matrizSubtitulo}>Configure el acceso por módulo para este rol</div>
          </div>
          <button type="button" className="btn btnPrimary" onClick={guardar} disabled={guardando || !rolActivoId}>
            {guardando ? 'Guardando…' : 'Guardar Cambios'}
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}
        {guardado && <div className={styles.exito}>Permisos guardados correctamente.</div>}

        <div className={styles.tablaHeader}>
          <div>Módulo</div>
          {PERMISOS_HEADERS.map((h) => <div key={h} className={styles.headerCentrado}>{h}</div>)}
        </div>
        {matriz.map((fila) => {
          const modConfig = PERMISOS_MODULOS.find((m) => m.modulo === fila.modulo);
          return (
            <div key={fila.modulo} className={styles.tablaFila}>
              <div className={styles.moduloCelda}>
                <span className="msr" style={{ fontSize: 19, color: 'var(--color-primary)' }}>{modConfig?.icono ?? 'settings'}</span>
                <span className={styles.moduloLabel}>{modConfig?.label ?? fila.modulo}</span>
              </div>
              {CAMPOS.map((campo) => (
                <div key={campo} className={styles.checkCelda}>
                  <input type="checkbox" checked={fila[campo]} onChange={(e) => toggle(fila.modulo, campo, e.target.checked)} />
                </div>
              ))}
            </div>
          );
        })}
      </section>
    </div>
  );
}
