import { useEffect, useState } from 'react';
import Tabs from '../components/common/Tabs';
import CatalogoTab from '../components/parametrizacion/CatalogoTab';
import ConveniosTab from '../components/parametrizacion/ConveniosTab';
import TarifasTab from '../components/parametrizacion/TarifasTab';
import { getEps, createEps, updateEps, setEstadoEps } from '../api/eps.api';
import { getEspecialidades, createEspecialidad, updateEspecialidad, setEstadoEspecialidad } from '../api/catalogosAgenda.api';
import { getServicios, createServicio, updateServicio, setEstadoServicio, getConvenios } from '../api/catalogosFacturacion.api';
import { searchCups, createCups, updateCups, setEstadoCups } from '../api/cups.api';
import { TABS_PARAMETRIZACION } from '../constants/parametrizacion';
import { formatMoneda } from '../utils/formato';
import styles from '../styles/parametrizacion/ParametrizacionPage.module.css';

export default function ParametrizacionPage() {
  const [tab, setTab] = useState('eps');
  const [epsList, setEpsList] = useState([]);
  const [convenios, setConvenios] = useState([]);

  useEffect(() => {
    getEps({ todas: true }).then(setEpsList).catch(() => setEpsList([]));
    getConvenios({ todas: true }).then(setConvenios).catch(() => setConvenios([]));
  }, []);

  return (
    <div className={styles.page}>
      <section className={`card ${styles.tabsCard}`}>
        <Tabs tabs={TABS_PARAMETRIZACION} active={tab} onChange={setTab} />
      </section>

      {tab === 'eps' && (
        <CatalogoTab
          tipoLabel="EPS"
          listFn={getEps}
          createFn={createEps}
          updateFn={updateEps}
          setEstadoFn={setEstadoEps}
          estadoField="activa"
          columns={[
            { key: 'nombre', header: 'Nombre', width: '1.6fr', render: (r) => r.nombre },
            { key: 'codigo', header: 'Código', width: '1fr', render: (r) => r.codigo },
          ]}
          camposIniciales={(item) => ({ codigo: item?.codigo ?? '', nombre: item?.nombre ?? '' })}
          renderCampos={({ campos, setCampos }) => (
            <>
              <div>
                <div className="fieldLabel">Nombre <span className="required">*</span></div>
                <input className="input" value={campos.nombre} onChange={(e) => setCampos({ ...campos, nombre: e.target.value })} required />
              </div>
              <div>
                <div className="fieldLabel">Código <span className="required">*</span></div>
                <input className="input" value={campos.codigo} onChange={(e) => setCampos({ ...campos, codigo: e.target.value })} required />
              </div>
            </>
          )}
          payloadDeCampos={(campos) => campos}
        />
      )}

      {tab === 'especialidades' && (
        <CatalogoTab
          tipoLabel="Especialidades"
          listFn={getEspecialidades}
          createFn={createEspecialidad}
          updateFn={updateEspecialidad}
          setEstadoFn={setEstadoEspecialidad}
          estadoField="activa"
          columns={[
            { key: 'nombre', header: 'Especialidad', width: '1.6fr', render: (r) => r.nombre },
            { key: 'codigo', header: 'Código', width: '1fr', render: (r) => r.codigo ?? '—' },
            { key: 'consultorios', header: 'Consultorios', width: '1fr', render: (r) => r._count?.consultorios ?? 0 },
          ]}
          camposIniciales={(item) => ({ codigo: item?.codigo ?? '', nombre: item?.nombre ?? '' })}
          renderCampos={({ campos, setCampos }) => (
            <>
              <div>
                <div className="fieldLabel">Especialidad <span className="required">*</span></div>
                <input className="input" value={campos.nombre} onChange={(e) => setCampos({ ...campos, nombre: e.target.value })} required />
              </div>
              <div>
                <div className="fieldLabel">Código</div>
                <input className="input" value={campos.codigo} onChange={(e) => setCampos({ ...campos, codigo: e.target.value })} />
              </div>
            </>
          )}
          payloadDeCampos={(campos) => campos}
        />
      )}

      {tab === 'servicios' && (
        <CatalogoTab
          tipoLabel="Servicios"
          listFn={getServicios}
          createFn={createServicio}
          updateFn={updateServicio}
          setEstadoFn={setEstadoServicio}
          estadoField="activo"
          columns={[
            { key: 'nombre', header: 'Servicio', width: '1.6fr', render: (r) => r.nombre },
            { key: 'codigo', header: 'CUPS', width: '0.9fr', render: (r) => r.codigo },
            { key: 'valorBase', header: 'Tarifa Base', width: '1fr', render: (r) => formatMoneda(r.valorBase) },
          ]}
          camposIniciales={(item) => ({ codigo: item?.codigo ?? '', nombre: item?.nombre ?? '', valorBase: item?.valorBase ?? '' })}
          renderCampos={({ campos, setCampos }) => (
            <>
              <div>
                <div className="fieldLabel">Servicio <span className="required">*</span></div>
                <input className="input" value={campos.nombre} onChange={(e) => setCampos({ ...campos, nombre: e.target.value })} required />
              </div>
              <div>
                <div className="fieldLabel">Código CUPS <span className="required">*</span></div>
                <input className="input" value={campos.codigo} onChange={(e) => setCampos({ ...campos, codigo: e.target.value })} required />
              </div>
              <div>
                <div className="fieldLabel">Tarifa Base <span className="required">*</span></div>
                <input className="input" type="number" min={0} value={campos.valorBase} onChange={(e) => setCampos({ ...campos, valorBase: e.target.value })} required />
              </div>
            </>
          )}
          payloadDeCampos={(campos) => campos}
        />
      )}

      {tab === 'convenios' && <ConveniosTab epsList={epsList} />}

      {tab === 'tarifas' && <TarifasTab convenios={convenios} />}

      {tab === 'cups' && (
        <CatalogoTab
          tipoLabel="CUPS"
          listFn={(opts) => searchCups('', opts)}
          createFn={createCups}
          updateFn={updateCups}
          setEstadoFn={setEstadoCups}
          estadoField="activo"
          columns={[
            { key: 'codigo', header: 'Código CUPS', width: '1fr', render: (r) => r.codigo },
            { key: 'nombre', header: 'Descripción', width: '2fr', render: (r) => r.nombre },
          ]}
          camposIniciales={(item) => ({ codigo: item?.codigo ?? '', nombre: item?.nombre ?? '' })}
          renderCampos={({ campos, setCampos }) => (
            <>
              <div>
                <div className="fieldLabel">Código CUPS <span className="required">*</span></div>
                <input className="input" value={campos.codigo} onChange={(e) => setCampos({ ...campos, codigo: e.target.value })} required />
              </div>
              <div>
                <div className="fieldLabel">Descripción <span className="required">*</span></div>
                <input className="input" value={campos.nombre} onChange={(e) => setCampos({ ...campos, nombre: e.target.value })} required />
              </div>
            </>
          )}
          payloadDeCampos={(campos) => campos}
        />
      )}
    </div>
  );
}
