import { useEffect, useMemo, useState } from 'react';
import SearchSelect from '../components/common/SearchSelect';
import Tabs from '../components/common/Tabs';
import DocumentoTab from '../components/formulas-ordenes/DocumentoTab';
import ConsentimientoTab from '../components/formulas-ordenes/ConsentimientoTab';
import MedicamentosEditor, { MEDICAMENTO_VACIO } from '../components/formulas-ordenes/MedicamentosEditor';
import OrdenItemsEditor from '../components/formulas-ordenes/OrdenItemsEditor';
import {
  anularFormula, anularOrden, anularRemision, anularIncapacidad,
  createFormula, createOrden, createRemision, createIncapacidad,
  listFormulas, listOrdenes, listRemisiones, listIncapacidades,
} from '../api/formulasOrdenes.api';
import { searchCie10 } from '../api/cie10.api';
import { listPacientes } from '../api/pacientes.api';
import { getMedicos } from '../api/catalogosAgenda.api';
import { getSedes } from '../api/sedes.api';
import { TABS_FORMULAS_ORDENES, estadoDocumento, labelPrioridad } from '../constants/formulasOrdenes';
import { formatDocumento, formatFecha } from '../utils/formato';
import { toISODateLocal } from '../utils/fechas';
import styles from '../styles/formulas-ordenes/FormulasOrdenesPage.module.css';

export default function FormulasOrdenesPage() {
  const [paciente, setPaciente] = useState(null);
  const [sedes, setSedes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [tab, setTab] = useState('formula');

  useEffect(() => {
    getSedes().then(setSedes).catch(() => setSedes([]));
    getMedicos().then(setMedicos).catch(() => setMedicos([]));
  }, []);

  const sedeDefaultId = useMemo(() => (sedes.find((s) => s.esPrincipal) ?? sedes[0])?.id, [sedes]);

  const buscarPacientes = useMemo(
    () => async (query) => {
      const esDocumento = /^\d+$/.test(query);
      const res = await listPacientes(esDocumento ? { documento: query, pageSize: 8 } : { search: query, pageSize: 8 });
      return res.data;
    },
    [],
  );

  return (
    <div className={styles.page}>
      <section className={`card ${styles.buscadorCard}`}>
        <div className="fieldLabel">Buscar Paciente</div>
        <SearchSelect
          value={paciente}
          onChange={setPaciente}
          fetcher={buscarPacientes}
          getLabel={(p) => `${p.nombres} ${p.apellidos}`}
          getSublabel={(p) => `${p.tipoDocumento} ${formatDocumento(p.numeroDocumento)} · ${p.eps?.nombre ?? ''}`}
          placeholder="Nombre, apellido o documento…"
        />
      </section>

      {!paciente && <div className={styles.sinPaciente}>Busca un paciente para emitir o consultar sus fórmulas, órdenes, remisiones, incapacidades y consentimientos.</div>}

      {paciente && (
        <section className={`card ${styles.tabsCard}`}>
          <Tabs tabs={TABS_FORMULAS_ORDENES} active={tab} onChange={setTab} />
        </section>
      )}

      {paciente && tab === 'formula' && (
        <DocumentoTab
          key={`formula-${paciente.id}`}
          paciente={paciente}
          medicos={medicos}
          sedes={sedes}
          sedeDefaultId={sedeDefaultId}
          tipoLabel="Fórmula Médica"
          listFn={listFormulas}
          createFn={createFormula}
          anularFn={anularFormula}
          estadoDe={(doc) => estadoDocumento(doc.estado)}
          puedeAnular={(doc) => doc.estado !== 'anulado'}
          renderResumen={(doc) => doc.items.map((i) => i.medicamento).join(', ')}
          renderMeta={(doc) => `${doc.items.length} medicamento(s)`}
          camposIniciales={() => ({ items: [{ ...MEDICAMENTO_VACIO }] })}
          renderCampos={({ campos, setCampos }) => (
            <MedicamentosEditor items={campos.items} onChange={(items) => setCampos({ items })} />
          )}
          payloadDeCampos={(campos) => ({ items: campos.items })}
          renderPreview={(doc) => (
            <div>
              {doc.items.map((item, i) => (
                <div key={i} style={{ marginBottom: 6 }}>
                  <strong>{item.medicamento}</strong> — {item.dosis}, {item.frecuencia}, {item.duracion}
                </div>
              ))}
            </div>
          )}
        />
      )}

      {paciente && tab === 'orden' && (
        <DocumentoTab
          key={`orden-${paciente.id}`}
          paciente={paciente}
          medicos={medicos}
          sedes={sedes}
          sedeDefaultId={sedeDefaultId}
          tipoLabel="Orden de Laboratorio"
          listFn={listOrdenes}
          createFn={createOrden}
          anularFn={anularOrden}
          estadoDe={(doc) => estadoDocumento(doc.estado)}
          puedeAnular={(doc) => doc.estado !== 'anulado'}
          renderResumen={(doc) => doc.items.map((i) => i.cups.codigo).join(', ')}
          renderMeta={(doc) => doc.items.map((i) => i.cups.nombre).join(', ')}
          camposIniciales={() => ({ items: [] })}
          renderCampos={({ campos, setCampos }) => (
            <OrdenItemsEditor items={campos.items} onChange={(items) => setCampos({ items })} />
          )}
          payloadDeCampos={(campos) => ({ items: campos.items.map(({ cupsId, prioridad }) => ({ cupsId, prioridad })) })}
          renderPreview={(doc) => (
            <div>
              {doc.items.map((item) => (
                <div key={item.id} style={{ marginBottom: 6 }}>
                  <strong>{item.cups.codigo}</strong> — {item.cups.nombre} ({labelPrioridad(item.prioridad)})
                </div>
              ))}
            </div>
          )}
        />
      )}

      {paciente && tab === 'remision' && (
        <DocumentoTab
          key={`remision-${paciente.id}`}
          paciente={paciente}
          medicos={medicos}
          sedes={sedes}
          sedeDefaultId={sedeDefaultId}
          tipoLabel="Remisión"
          listFn={listRemisiones}
          createFn={createRemision}
          anularFn={anularRemision}
          estadoDe={(doc) => estadoDocumento(doc.estado)}
          puedeAnular={(doc) => doc.estado !== 'anulado'}
          renderResumen={(doc) => `${doc.especialidadDestino} → ${doc.ipsDestino}`}
          renderMeta={(doc) => doc.justificacion}
          camposIniciales={() => ({ especialidadDestino: '', ipsDestino: '', justificacion: '' })}
          renderCampos={({ campos, setCampos }) => (
            <>
              <div>
                <div className="fieldLabel">Especialidad Destino <span className="required">*</span></div>
                <input
                  className="input"
                  value={campos.especialidadDestino}
                  onChange={(e) => setCampos({ ...campos, especialidadDestino: e.target.value })}
                  required
                />
              </div>
              <div>
                <div className="fieldLabel">IPS de Destino <span className="required">*</span></div>
                <input
                  className="input"
                  value={campos.ipsDestino}
                  onChange={(e) => setCampos({ ...campos, ipsDestino: e.target.value })}
                  required
                />
              </div>
              <div>
                <div className="fieldLabel">Justificación <span className="required">*</span></div>
                <textarea
                  className="input"
                  style={{ resize: 'vertical', height: 70 }}
                  value={campos.justificacion}
                  onChange={(e) => setCampos({ ...campos, justificacion: e.target.value })}
                  required
                  minLength={5}
                />
              </div>
            </>
          )}
          payloadDeCampos={(campos) => campos}
          renderPreview={(doc) => (
            <div>
              <div><strong>Especialidad / IPS de destino:</strong> {doc.especialidadDestino} — {doc.ipsDestino}</div>
              <div style={{ marginTop: 8 }}><strong>Justificación:</strong> {doc.justificacion}</div>
            </div>
          )}
        />
      )}

      {paciente && tab === 'incapacidad' && (
        <DocumentoTab
          key={`incapacidad-${paciente.id}`}
          paciente={paciente}
          medicos={medicos}
          sedes={sedes}
          sedeDefaultId={sedeDefaultId}
          tipoLabel="Incapacidad"
          listFn={listIncapacidades}
          createFn={createIncapacidad}
          anularFn={anularIncapacidad}
          estadoDe={(doc) => estadoDocumento(doc.estado)}
          puedeAnular={(doc) => doc.estado !== 'anulado'}
          renderResumen={(doc) => `${doc.cie10.codigo} · ${doc.numeroDias} día(s)`}
          renderMeta={(doc) => `${formatFecha(doc.fechaInicio)} - ${formatFecha(doc.fechaFin)}`}
          camposIniciales={() => ({
            cie10: null,
            numeroDias: 3,
            fechaInicio: toISODateLocal(new Date()),
            fechaFin: toISODateLocal(new Date()),
          })}
          renderCampos={({ campos, setCampos }) => (
            <>
              <div>
                <div className="fieldLabel">Diagnóstico CIE-10 <span className="required">*</span></div>
                <SearchSelect
                  value={campos.cie10}
                  onChange={(cie10) => setCampos({ ...campos, cie10 })}
                  fetcher={searchCie10}
                  getLabel={(c) => `${c.codigo} - ${c.descripcion}`}
                  placeholder="Buscar código o descripción…"
                  minChars={1}
                />
              </div>
              <div className={styles.grid3}>
                <div>
                  <div className="fieldLabel">Número de Días <span className="required">*</span></div>
                  <input
                    className="input"
                    type="number"
                    min={1}
                    max={180}
                    value={campos.numeroDias}
                    onChange={(e) => setCampos({ ...campos, numeroDias: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <div className="fieldLabel">Fecha Inicio <span className="required">*</span></div>
                  <input
                    className="input"
                    type="date"
                    value={campos.fechaInicio}
                    onChange={(e) => setCampos({ ...campos, fechaInicio: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <div className="fieldLabel">Fecha Fin <span className="required">*</span></div>
                  <input
                    className="input"
                    type="date"
                    value={campos.fechaFin}
                    onChange={(e) => setCampos({ ...campos, fechaFin: e.target.value })}
                    required
                  />
                </div>
              </div>
            </>
          )}
          payloadDeCampos={(campos) => ({
            cie10Id: campos.cie10?.id,
            numeroDias: campos.numeroDias,
            fechaInicio: campos.fechaInicio,
            fechaFin: campos.fechaFin,
          })}
          renderPreview={(doc) => (
            <div>
              <div><strong>Diagnóstico:</strong> {doc.cie10.codigo} - {doc.cie10.descripcion}</div>
              <div><strong>Número de días:</strong> {doc.numeroDias}</div>
              <div><strong>Periodo:</strong> {formatFecha(doc.fechaInicio)} - {formatFecha(doc.fechaFin)}</div>
            </div>
          )}
        />
      )}

      {paciente && tab === 'consentimiento' && (
        <ConsentimientoTab
          key={`consentimiento-${paciente.id}`}
          paciente={paciente}
          medicos={medicos}
          sedes={sedes}
          sedeDefaultId={sedeDefaultId}
        />
      )}
    </div>
  );
}
