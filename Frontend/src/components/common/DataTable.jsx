import styles from '../../styles/common/DataTable.module.css';

function buildPages(page, totalPages) {
  const windowSize = 5;
  let start = Math.max(1, page - Math.floor(windowSize / 2));
  const end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  const pages = [];
  for (let p = start; p <= end; p += 1) pages.push(p);
  return pages;
}

export default function DataTable({
  columns,
  rows,
  rowKey = (row) => row.id,
  loading = false,
  emptyMessage = 'No se encontraron registros',
  pagination,
  itemLabel = 'registros',
}) {
  const gridTemplate = columns.map((c) => c.width ?? '1fr').join(' ');

  return (
    <div>
      <div className={styles.headerRow} style={{ gridTemplateColumns: gridTemplate }}>
        {columns.map((col) => (
          <div key={col.key} className={styles.headerCell} style={col.align ? { textAlign: col.align } : undefined}>
            {col.header}
          </div>
        ))}
      </div>

      {loading && <div className={styles.stateRow}>Cargando…</div>}

      {!loading && rows.length === 0 && <div className={styles.stateRow}>{emptyMessage}</div>}

      {!loading &&
        rows.map((row) => (
          <div key={rowKey(row)} className={styles.row} style={{ gridTemplateColumns: gridTemplate }}>
            {columns.map((col) => (
              <div key={col.key} className={styles.cell} style={col.align ? { textAlign: col.align } : undefined}>
                {col.render ? col.render(row) : row[col.key]}
              </div>
            ))}
          </div>
        ))}

      {pagination && pagination.total > 0 && (
        <div className={styles.paginationBar}>
          <div className={styles.paginationInfo}>
            Mostrando {(pagination.page - 1) * pagination.pageSize + 1}-
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} de {pagination.total} {itemLabel}
          </div>
          <div className={styles.pager}>
            <button
              type="button"
              className={styles.pageBtn}
              disabled={pagination.page <= 1}
              onClick={() => pagination.onPage(pagination.page - 1)}
              aria-label="Página anterior"
            >
              <span className="msr" style={{ fontSize: 16 }}>chevron_left</span>
            </button>
            {buildPages(pagination.page, Math.ceil(pagination.total / pagination.pageSize)).map((p) => (
              <button
                key={p}
                type="button"
                className={`${styles.pageBtn} ${p === pagination.page ? styles.pageActive : ''}`}
                onClick={() => pagination.onPage(p)}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              className={styles.pageBtn}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
              onClick={() => pagination.onPage(pagination.page + 1)}
              aria-label="Página siguiente"
            >
              <span className="msr" style={{ fontSize: 16 }}>chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
