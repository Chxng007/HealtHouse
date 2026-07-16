import { useEffect, useRef, useState } from 'react';
import styles from '../../styles/common/SearchSelect.module.css';

export default function SearchSelect({
  value,
  onChange,
  fetcher,
  getLabel,
  getSublabel,
  placeholder = 'Buscar…',
  minChars = 2,
}) {
  const [query, setQuery] = useState('');
  const [opciones, setOpciones] = useState([]);
  const [abierto, setAbierto] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const contRef = useRef(null);

  useEffect(() => {
    const onClickFuera = (e) => {
      if (contRef.current && !contRef.current.contains(e.target)) setAbierto(false);
    };
    document.addEventListener('mousedown', onClickFuera);
    return () => document.removeEventListener('mousedown', onClickFuera);
  }, []);

  useEffect(() => {
    if (query.trim().length < minChars) {
      setOpciones([]);
      return undefined;
    }
    let cancelado = false;
    setBuscando(true);
    const timer = setTimeout(() => {
      fetcher(query.trim())
        .then((res) => {
          if (!cancelado) {
            setOpciones(res);
            setAbierto(true);
          }
        })
        .catch(() => !cancelado && setOpciones([]))
        .finally(() => !cancelado && setBuscando(false));
    }, 300);
    return () => {
      cancelado = true;
      clearTimeout(timer);
    };
  }, [query, fetcher, minChars]);

  if (value) {
    return (
      <div className={styles.seleccionado}>
        <div className={styles.seleccionadoInfo}>
          <div className={styles.seleccionadoLabel}>{getLabel(value)}</div>
          {getSublabel && <div className={styles.seleccionadoSub}>{getSublabel(value)}</div>}
        </div>
        <button type="button" className={styles.limpiarBtn} onClick={() => onChange(null)} aria-label="Quitar selección">
          <span className="msr" style={{ fontSize: 16 }}>close</span>
        </button>
      </div>
    );
  }

  return (
    <div className={styles.contenedor} ref={contRef}>
      <div className={styles.inputWrap}>
        <span className="msr" style={{ fontSize: 18, color: 'var(--text-placeholder)' }}>search</span>
        <input
          type="text"
          value={query}
          placeholder={placeholder}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => opciones.length > 0 && setAbierto(true)}
        />
        {buscando && <span className={styles.buscando}>…</span>}
      </div>
      {abierto && opciones.length > 0 && (
        <div className={styles.dropdown}>
          {opciones.map((opcion, i) => (
            <button
              key={opcion.id ?? i}
              type="button"
              className={styles.opcion}
              onClick={() => {
                onChange(opcion);
                setAbierto(false);
                setQuery('');
              }}
            >
              <div className={styles.opcionLabel}>{getLabel(opcion)}</div>
              {getSublabel && <div className={styles.opcionSub}>{getSublabel(opcion)}</div>}
            </button>
          ))}
        </div>
      )}
      {abierto && !buscando && opciones.length === 0 && query.trim().length >= minChars && (
        <div className={styles.dropdown}>
          <div className={styles.sinResultados}>Sin resultados para “{query}”</div>
        </div>
      )}
    </div>
  );
}
