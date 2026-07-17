import { useState } from 'react';
import SearchSelect from '../common/SearchSelect';
import { CONDICIONES_DIAGNOSTICO, TIPOS_DIAGNOSTICO, condicionDiagnostico, labelTipoDiagnostico } from '../../constants/hce';
import { searchCie10 } from '../../api/cie10.api';
import styles from '../../styles/historia-clinica/DiagnosticosSection.module.css';

export default function DiagnosticosSection({ diagnosticos, onChange, disabled }) {
  const [agregando, setAgregando] = useState(false);
  const [cie10Sel, setCie10Sel] = useState(null);
  const [tipoSel, setTipoSel] = useState('principal');
  const [condicionSel, setCondicionSel] = useState('confirmado');
  const [error, setError] = useState(null);

  const buscarCie10 = (query) => searchCie10(query);

  const agregar = () => {
    if (!cie10Sel) {
      setError('Selecciona un código CIE-10.');
      return;
    }
    if (diagnosticos.some((d) => d.cie10Id === cie10Sel.id)) {
      setError('Ese código ya fue agregado.');
      return;
    }
    onChange([...diagnosticos, { cie10Id: cie10Sel.id, cie10: cie10Sel, tipo: tipoSel, condicion: condicionSel }]);
    setCie10Sel(null);
    setTipoSel('principal');
    setCondicionSel('confirmado');
    setError(null);
    setAgregando(false);
  };

  const quitar = (cie10Id) => onChange(diagnosticos.filter((d) => d.cie10Id !== cie10Id));

  return (
    <section className={`card ${styles.section}`}>
      <div className={styles.header}>
        <h2 className="sectionTitleSm">Diagnósticos CIE-10</h2>
        {!disabled && (
          <button type="button" className={styles.agregarBtn} onClick={() => setAgregando((v) => !v)}>
            <span className="msr" style={{ fontSize: 16 }}>add</span> Agregar Diagnóstico
          </button>
        )}
      </div>

      {agregando && (
        <div className={styles.formAgregar}>
          <div className={styles.formCie10}>
            <SearchSelect
              value={cie10Sel}
              onChange={setCie10Sel}
              fetcher={buscarCie10}
              getLabel={(c) => `${c.codigo} - ${c.descripcion}`}
              placeholder="Buscar código o descripción CIE-10…"
              minChars={1}
            />
          </div>
          <select className="select" value={tipoSel} onChange={(e) => setTipoSel(e.target.value)}>
            {TIPOS_DIAGNOSTICO.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select className="select" value={condicionSel} onChange={(e) => setCondicionSel(e.target.value)}>
            {CONDICIONES_DIAGNOSTICO.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <button type="button" className="btn btnPrimary" onClick={agregar}>Agregar</button>
        </div>
      )}
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.tablaHeader}>
        <div>CÓDIGO</div><div>DESCRIPCIÓN</div><div>TIPO</div><div>CONDICIÓN</div><div />
      </div>
      {diagnosticos.length === 0 && <div className={styles.vacio}>Sin diagnósticos registrados.</div>}
      {diagnosticos.map((d) => {
        const cond = condicionDiagnostico(d.condicion);
        return (
          <div key={d.cie10Id} className={styles.fila}>
            <div className={styles.codigo}>{d.cie10.codigo}</div>
            <div>{d.cie10.descripcion}</div>
            <div className={styles.tipo}>{labelTipoDiagnostico(d.tipo)}</div>
            <div>
              <span className={`${styles.condicion} ${styles[cond.badge]}`}>{cond.label}</span>
            </div>
            <div>
              {!disabled && (
                <button type="button" className={styles.quitarBtn} onClick={() => quitar(d.cie10Id)} aria-label="Quitar diagnóstico">
                  <span className="msr" style={{ fontSize: 16 }}>close</span>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}
