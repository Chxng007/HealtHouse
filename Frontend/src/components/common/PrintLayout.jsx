import { useEffect, useState } from 'react';
import { getConfiguracion } from '../../api/configuracion.api';
import { formatFecha } from '../../utils/formato';
import styles from '../../styles/common/PrintLayout.module.css';

const IPS_DEFAULT = { nombre: 'HealthCore IPS', sedePrincipal: 'Sede Principal' };

export default function PrintLayout({ titulo, paciente, documento, medico, fecha, children }) {
  const [ips, setIps] = useState(IPS_DEFAULT);

  useEffect(() => {
    getConfiguracion('ips').then((c) => setIps(c.valor)).catch(() => {});
  }, []);

  return (
    <div className={`printArea ${styles.hoja}`}>
      <div className={styles.encabezado}>
        <div className={styles.ips}>{ips.nombre} · {ips.sedePrincipal}{ips.nit ? ` · NIT ${ips.nit}` : ''}</div>
        <div className={styles.fecha}>Fecha: {formatFecha(fecha ?? new Date())}</div>
      </div>
      {paciente && (
        <div className={styles.paciente}>
          <div className={styles.pacienteNombre}>Paciente: {paciente}</div>
          {documento && <div>{documento}</div>}
        </div>
      )}
      <div className={styles.titulo}>{titulo}</div>
      <div className={styles.cuerpo}>{children}</div>
      {medico && <div className={styles.firma}>Documento generado por {medico}</div>}
    </div>
  );
}
