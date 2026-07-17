import { useEffect, useMemo, useState } from 'react';
import { generarRips, listRips } from '../api/rips.api';
import { getSedes } from '../api/sedes.api';
import { estadoRips, severidadDe } from '../constants/rips';
import { formatFecha } from '../utils/formato';
import { startOfMonth, toISODateLocal } from '../utils/fechas';
import styles from '../styles/rips/RipsPage.module.css';

function descargarJson(rips) {
  const blob = new Blob([JSON.stringify(rips.contenido, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `RIPS_${rips.desde.slice(0, 10)}_${rips.hasta.slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function RipsPage() {
  const [sedes, setSedes] = useState([]);
  const [sedeId, setSedeId] = useState('');
  const [desde, setDesde] = useState(toISODateLocal(startOfMonth(new Date())));
  const [hasta, setHasta] = useState(toISODateLocal(new Date()));
  const [historial, setHistorial] = useState([]);
  const [actual, setActual] = useState(null);
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getSedes().then(setSedes).catch(() => setSedes([]));
    listRips().then(setHistorial).catch(() => setHistorial([]));
  }, []);

  const stats = useMemo(() => {
    if (!actual) return null;
    const conteo = { error: 0, advertencia: 0, correcto: 0 };
    for (const v of actual.erroresValidacion) conteo[v.severidad] = (conteo[v.severidad] ?? 0) + 1;
    return {
      registros: actual.totalRegistros,
      correctos: conteo.correcto,
      errores: conteo.error,
      advertencias: conteo.advertencia,
    };
  }, [actual]);

  const generar = async () => {
    setGenerando(true);
    setError(null);
    try {
      const rips = await generarRips({ desde, hasta, sedeId: sedeId || undefined });
      setActual(rips);
      setHistorial((prev) => [rips, ...prev]);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerando(false);
    }
  };

  return (
    <div className={styles.page}>
      <section className={`card ${styles.filtrosCard}`}>
        <div>
          <div className="fieldLabel">Desde</div>
          <input className="input" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        </div>
        <div>
          <div className="fieldLabel">Hasta</div>
          <input className="input" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </div>
        <div>
          <div className="fieldLabel">Sede</div>
          <select className="select" value={sedeId} onChange={(e) => setSedeId(e.target.value)} style={{ width: 200 }}>
            <option value="">Todas las sedes</option>
            {sedes.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>
        </div>
        <div className={styles.espaciador} />
        {actual && (
          <button type="button" className="btn btnGhost" onClick={() => descargarJson(actual)}>
            <span className="msr" style={{ fontSize: 17 }}>download</span> Descargar JSON
          </button>
        )}
        <button type="button" className="btn btnPrimary" onClick={generar} disabled={generando}>
          <span className="msr" style={{ fontSize: 17 }}>fact_check</span>
          {generando ? 'Generando…' : 'Generar y Validar RIPS'}
        </button>
      </section>

      {error && <div className={styles.error}>{error}</div>}

      {stats && (
        <div className={styles.statsGrid}>
          <div className={`card ${styles.statCard}`}>
            <div className={`${styles.statIcon} ${styles.tonePrimary}`}><span className="msr" style={{ fontSize: 23 }}>folder_zip</span></div>
            <div><div className={styles.statValor}>{stats.registros}</div><div className={styles.statLabel}>Registros del Período</div></div>
          </div>
          <div className={`card ${styles.statCard}`}>
            <div className={`${styles.statIcon} ${styles.toneSuccess}`}><span className="msr" style={{ fontSize: 23 }}>check_circle</span></div>
            <div><div className={styles.statValor}>{stats.correctos}</div><div className={styles.statLabel}>Validados sin Errores</div></div>
          </div>
          <div className={`card ${styles.statCard}`}>
            <div className={`${styles.statIcon} ${styles.toneDanger}`}><span className="msr" style={{ fontSize: 23 }}>error</span></div>
            <div><div className={styles.statValor}>{stats.errores}</div><div className={styles.statLabel}>Errores de Codificación</div></div>
          </div>
          <div className={`card ${styles.statCard}`}>
            <div className={`${styles.statIcon} ${styles.toneAmber}`}><span className="msr" style={{ fontSize: 23 }}>warning</span></div>
            <div><div className={styles.statValor}>{stats.advertencias}</div><div className={styles.statLabel}>Advertencias</div></div>
          </div>
        </div>
      )}

      {actual && (
        <section className="card">
          <div className={styles.seccionTitulo}>Resultado de Validación</div>
          <div className={styles.tablaHeader}>
            <div>SEVERIDAD</div><div>REGISTRO</div><div>DESCRIPCIÓN</div><div>ESTADO</div>
          </div>
          {actual.erroresValidacion.length === 0 && <div className={styles.vacio}>Sin observaciones: todos los registros son válidos.</div>}
          {actual.erroresValidacion.map((v, i) => {
            const s = severidadDe(v.severidad);
            return (
              <div key={i} className={styles.tablaFila}>
                <div><span className="msr" style={{ fontSize: 19, color: s.color }}>{s.icon}</span></div>
                <div className={styles.registro}>{v.registro}</div>
                <div className={styles.descripcion}>{v.descripcion}</div>
                <div><span className={`${styles.estadoBadge} ${styles[s.badge]}`}>{s.label}</span></div>
              </div>
            );
          })}
        </section>
      )}

      {historial.length > 0 && (
        <section className="card">
          <div className={styles.seccionTitulo}>Generaciones Anteriores</div>
          <div className={styles.historialLista}>
            {historial.map((r) => {
              const e = estadoRips(r.estado);
              return (
                <button key={r.id} type="button" className={styles.historialItem} onClick={() => setActual(r)}>
                  <div>{formatFecha(r.desde)} — {formatFecha(r.hasta)}</div>
                  <div className={styles.historialSub}>{r.sede?.nombre ?? 'Todas las sedes'} · {r.totalRegistros} registros</div>
                  <span className={`${styles.estadoBadge} ${styles[e.badge]}`}>{e.label}</span>
                </button>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
