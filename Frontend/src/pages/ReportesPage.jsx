import { useEffect, useState } from 'react';
import { descargarExcelReporte, getIndicadores } from '../api/reportes.api';
import { formatMoneda } from '../utils/formato';
import { toISODateLocal, startOfMonth } from '../utils/fechas';
import styles from '../styles/dashboard/ReportesPage.module.css';

function Tendencia({ valor, sufijo = '%' }) {
  const positivo = valor >= 0;
  return (
    <span className={positivo ? styles.trendUp : styles.trendDown}>
      {positivo ? '+' : ''}{valor}{sufijo}
    </span>
  );
}

export default function ReportesPage() {
  const [desde, setDesde] = useState(toISODateLocal(startOfMonth(new Date())));
  const [hasta, setHasta] = useState(toISODateLocal(new Date()));
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);
  const [exportando, setExportando] = useState(false);

  useEffect(() => {
    getIndicadores({ desde, hasta }).then(setDatos).catch((err) => setError(err.message));
  }, [desde, hasta]);

  const exportarExcel = async () => {
    setExportando(true);
    try {
      await descargarExcelReporte({ desde, hasta });
    } catch (err) {
      setError(err.message);
    } finally {
      setExportando(false);
    }
  };

  if (error) return <div className={styles.error}>{error}</div>;
  if (!datos) return <div className={styles.cargando}>Cargando…</div>;

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div>
          <div className="fieldLabel">Desde</div>
          <input className="input" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        </div>
        <div>
          <div className="fieldLabel">Hasta</div>
          <input className="input" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </div>
        <div className={styles.espaciador} />
        <button type="button" className="btn btnGhost" onClick={exportarExcel} disabled={exportando}>
          <span className="msr" style={{ fontSize: 17 }}>grid_on</span> {exportando ? 'Generando…' : 'Excel'}
        </button>
        <button type="button" className="btn btnGhost" onClick={() => window.print()}>
          <span className="msr" style={{ fontSize: 17 }}>picture_as_pdf</span> PDF
        </button>
      </div>

      <div className={`printArea ${styles.printArea}`}>
        <div className={styles.kpisGrid}>
          <div className={`card ${styles.kpiCard}`}>
            <div className={styles.kpiHeader}><span className="msr" style={{ fontSize: 20, color: 'var(--color-primary)' }}>event_available</span><span className={styles.kpiLabel}>Atenciones (Período)</span></div>
            <div className={styles.kpiFila}><div className={styles.kpiValor}>{datos.kpis.atencionesMes}</div><Tendencia valor={datos.kpis.atencionesTrend} /></div>
          </div>
          <div className={`card ${styles.kpiCard}`}>
            <div className={styles.kpiHeader}><span className="msr" style={{ fontSize: 20, color: 'var(--color-success-dark)' }}>payments</span><span className={styles.kpiLabel}>Ingresos (Período)</span></div>
            <div className={styles.kpiFila}><div className={styles.kpiValor}>{formatMoneda(datos.kpis.ingresosMes)}</div><Tendencia valor={datos.kpis.ingresosTrend} /></div>
          </div>
          <div className={`card ${styles.kpiCard}`}>
            <div className={styles.kpiHeader}><span className="msr" style={{ fontSize: 20, color: 'var(--color-amber)' }}>event_busy</span><span className={styles.kpiLabel}>Ocupación de Agenda</span></div>
            <div className={styles.kpiFila}><div className={styles.kpiValor}>{datos.kpis.ocupacionAgenda}%</div><Tendencia valor={datos.kpis.ocupacionTrend} sufijo="pp" /></div>
          </div>
          <div className={`card ${styles.kpiCard}`}>
            <div className={styles.kpiHeader}><span className="msr" style={{ fontSize: 20, color: '#7c3aed' }}>trending_up</span><span className={styles.kpiLabel}>Productividad Promedio</span></div>
            <div className={styles.kpiFila}><div className={styles.kpiValor}>{datos.kpis.productividadPromedio}/mes</div><Tendencia valor={datos.kpis.productividadTrend} /></div>
          </div>
        </div>

        <div className={styles.grid2}>
          <section className="card" style={{ padding: 22 }}>
            <div className={styles.seccionTitulo}>Atenciones por Mes</div>
            <div className={styles.barrasChart}>
              {datos.atencionesPorMes.map((m) => (
                <div key={m.label} className={styles.barraCol}>
                  <div className={styles.barraTrack}>
                    <div className={styles.barra} style={{ height: `${Math.max(m.pct, 2)}%` }} title={`${m.cantidad} atenciones`} />
                  </div>
                  <div className={styles.barraLabel}>{m.label}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="card" style={{ padding: 22 }}>
            <div className={styles.seccionTitulo}>Productividad por Médico</div>
            <div className={styles.productividadLista}>
              {datos.productividadPorMedico.length === 0 && <div className={styles.vacio}>Sin médicos activos.</div>}
              {datos.productividadPorMedico.map((p) => (
                <div key={p.nombre}>
                  <div className={styles.productividadFila}>
                    <span className={styles.productividadNombre}>{p.nombre}</span>
                    <span className={styles.productividadValor}>{p.atenciones} atenciones</span>
                  </div>
                  <div className={styles.progresoTrack}>
                    <div className={styles.progresoBarra} style={{ width: `${p.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="card">
          <div className={styles.seccionTituloTabla}>Reportes Financieros por Sede</div>
          <div className={styles.tablaHeader}>
            <div>SEDE</div><div>FACTURACIÓN</div><div>RECAUDO</div><div>CARTERA</div><div>OCUPACIÓN AGENDA</div>
          </div>
          {datos.sedesReporte.map((s) => (
            <div key={s.nombre} className={styles.tablaFila}>
              <div className={styles.sedeNombre}>{s.nombre}</div>
              <div>{formatMoneda(s.facturacion)}</div>
              <div>{formatMoneda(s.recaudo)}</div>
              <div className={styles.cartera}>{formatMoneda(s.cartera)}</div>
              <div>{s.ocupacion}%</div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
