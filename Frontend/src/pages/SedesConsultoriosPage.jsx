import { useEffect, useState } from 'react';
import DataTable from '../components/common/DataTable';
import EstadoBadge from '../components/common/EstadoBadge';
import CatalogoFormModal from '../components/parametrizacion/CatalogoFormModal';
import { getSedes, createSede, updateSede, setEstadoSede } from '../api/sedes.api';
import { getConsultorios, createConsultorio, updateConsultorio, setEstadoConsultorio, getEspecialidades, getMedicos } from '../api/catalogosAgenda.api';
import styles from '../styles/parametrizacion/SedesConsultoriosPage.module.css';

export default function SedesConsultoriosPage() {
  const [sedes, setSedes] = useState([]);
  const [consultorios, setConsultorios] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [error, setError] = useState(null);
  const [modalSede, setModalSede] = useState(undefined);
  const [modalConsultorio, setModalConsultorio] = useState(undefined);
  const [procesando, setProcesando] = useState(null);

  const refrescarSedes = () => getSedes({ todas: true }).then(setSedes).catch((err) => setError(err.message));
  const refrescarConsultorios = () => getConsultorios(undefined, { todas: true }).then(setConsultorios).catch((err) => setError(err.message));

  useEffect(() => {
    refrescarSedes();
    refrescarConsultorios();
    getEspecialidades().then(setEspecialidades).catch(() => setEspecialidades([]));
    getMedicos().then(setMedicos).catch(() => setMedicos([]));
  }, []);

  const toggleSede = async (sede) => {
    setProcesando(sede.id);
    try {
      await setEstadoSede(sede.id, !sede.activa);
      refrescarSedes();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(null);
    }
  };

  const toggleConsultorio = async (c) => {
    setProcesando(c.id);
    try {
      await setEstadoConsultorio(c.id, !c.activo);
      refrescarConsultorios();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(null);
    }
  };

  const columnasConsultorios = [
    { key: 'nombre', header: 'Número', width: '0.6fr', render: (c) => <span className={styles.numero}>{c.nombre}</span> },
    { key: 'sede', header: 'Sede', width: '1.2fr', render: (c) => c.sede.nombre },
    { key: 'especialidad', header: 'Especialidad', width: '1.2fr', render: (c) => c.especialidad?.nombre ?? '—' },
    { key: 'medico', header: 'Médico Asignado', width: '1.4fr', render: (c) => (c.medico ? `${c.medico.nombres} ${c.medico.apellidos}` : 'Sin asignar') },
    {
      key: 'estado',
      header: 'Estado',
      width: '1fr',
      render: (c) => <EstadoBadge variant={c.activo ? 'success' : 'neutral'}>{c.activo ? 'Disponible' : 'Inactivo'}</EstadoBadge>,
    },
    {
      key: 'acciones',
      header: '',
      width: '1fr',
      align: 'right',
      render: (c) => (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btnGhost" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => setModalConsultorio(c)}>Editar</button>
          <button
            type="button"
            className={`btn ${c.activo ? 'btnDanger' : 'btnGhost'}`}
            style={{ padding: '6px 12px', fontSize: 12 }}
            onClick={() => toggleConsultorio(c)}
            disabled={procesando === c.id}
          >
            {c.activo ? 'Desactivar' : 'Activar'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div className={styles.espaciador} />
        <button type="button" className="btn btnPrimary" onClick={() => setModalSede(null)}>
          <span className="msr" style={{ fontSize: 17 }}>add_business</span> Nueva Sede
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.sedesGrid}>
        {sedes.map((s) => (
          <div key={s.id} className={`card ${styles.sedeCard}`}>
            <div className={styles.sedeHeader}>
              <span className={styles.sedeIcono}><span className="msr" style={{ fontSize: 22 }}>apartment</span></span>
              <div className={styles.sedeInfo}>
                <div className={styles.sedeNombre}>{s.nombre}</div>
                <div className={styles.sedeDireccion}>{s.direccion ?? s.ciudad}</div>
              </div>
              {s.esPrincipal && <span className={styles.badgePrincipal}>Principal</span>}
            </div>
            <div className={styles.sedeDetalle}>
              <div><span className={styles.detalleLabel}>Habilitación:</span> {s.codigoHabilitacion ?? '—'}</div>
              <div><span className={styles.detalleLabel}>Horario:</span> {s.horarios?.general ?? '—'}</div>
              <div><span className={styles.detalleLabel}>Consultorios:</span> {s._count?.consultorios ?? 0}</div>
              <div><span className={styles.detalleLabel}>Teléfono:</span> {s.telefono ?? '—'}</div>
            </div>
            <div className={styles.sedeAcciones}>
              <button type="button" className="btn btnGhost" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => setModalSede(s)}>Editar</button>
              <button
                type="button"
                className={`btn ${s.activa ? 'btnDanger' : 'btnGhost'}`}
                style={{ padding: '6px 12px', fontSize: 12 }}
                onClick={() => toggleSede(s)}
                disabled={procesando === s.id}
              >
                {s.activa ? 'Desactivar' : 'Activar'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <section className="card">
        <div className={styles.consultoriosHeader}>
          <div className={styles.consultoriosTitulo}>Consultorios</div>
          <button type="button" className={styles.agregarBtn} onClick={() => setModalConsultorio(null)}>
            <span className="msr" style={{ fontSize: 16 }}>add</span> Nuevo Consultorio
          </button>
        </div>
        <DataTable columns={columnasConsultorios} rows={consultorios} emptyMessage="Sin consultorios registrados" itemLabel="consultorios" />
      </section>

      <CatalogoFormModal
        open={modalSede !== undefined}
        titulo={modalSede ? 'Editar Sede' : 'Nueva Sede'}
        item={modalSede}
        camposIniciales={(item) => ({
          nombre: item?.nombre ?? '',
          ciudad: item?.ciudad ?? '',
          esPrincipal: item?.esPrincipal ?? false,
          direccion: item?.direccion ?? '',
          telefono: item?.telefono ?? '',
          codigoHabilitacion: item?.codigoHabilitacion ?? '',
          horarioGeneral: item?.horarios?.general ?? '',
        })}
        renderCampos={({ campos, setCampos }) => (
          <>
            <div>
              <div className="fieldLabel">Nombre <span className="required">*</span></div>
              <input className="input" value={campos.nombre} onChange={(e) => setCampos({ ...campos, nombre: e.target.value })} required />
            </div>
            <div>
              <div className="fieldLabel">Ciudad <span className="required">*</span></div>
              <input className="input" value={campos.ciudad} onChange={(e) => setCampos({ ...campos, ciudad: e.target.value })} required />
            </div>
            <div>
              <div className="fieldLabel">Dirección</div>
              <input className="input" value={campos.direccion} onChange={(e) => setCampos({ ...campos, direccion: e.target.value })} />
            </div>
            <div>
              <div className="fieldLabel">Teléfono</div>
              <input className="input" value={campos.telefono} onChange={(e) => setCampos({ ...campos, telefono: e.target.value })} />
            </div>
            <div>
              <div className="fieldLabel">Código de Habilitación</div>
              <input className="input" value={campos.codigoHabilitacion} onChange={(e) => setCampos({ ...campos, codigoHabilitacion: e.target.value })} />
            </div>
            <div>
              <div className="fieldLabel">Horario</div>
              <input className="input" placeholder="Lun-Sáb 7am-7pm" value={campos.horarioGeneral} onChange={(e) => setCampos({ ...campos, horarioGeneral: e.target.value })} />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-label)' }}>
              <input type="checkbox" checked={campos.esPrincipal} onChange={(e) => setCampos({ ...campos, esPrincipal: e.target.checked })} />
              Marcar como sede principal
            </label>
          </>
        )}
        payloadDeCampos={(campos) => ({
          nombre: campos.nombre,
          ciudad: campos.ciudad,
          esPrincipal: campos.esPrincipal,
          direccion: campos.direccion,
          telefono: campos.telefono,
          codigoHabilitacion: campos.codigoHabilitacion,
          horarios: campos.horarioGeneral ? { general: campos.horarioGeneral } : undefined,
        })}
        onGuardar={async (payload, item) => {
          if (item) await updateSede(item.id, payload);
          else await createSede(payload);
          refrescarSedes();
        }}
        onClose={() => setModalSede(undefined)}
      />

      <CatalogoFormModal
        open={modalConsultorio !== undefined}
        titulo={modalConsultorio ? 'Editar Consultorio' : 'Nuevo Consultorio'}
        item={modalConsultorio}
        camposIniciales={(item) => ({
          nombre: item?.nombre ?? '',
          sedeId: item?.sedeId ?? sedes[0]?.id ?? '',
          especialidadId: item?.especialidadId ?? '',
          medicoId: item?.medicoId ?? '',
        })}
        renderCampos={({ campos, setCampos }) => (
          <>
            <div>
              <div className="fieldLabel">Número / Nombre <span className="required">*</span></div>
              <input className="input" value={campos.nombre} onChange={(e) => setCampos({ ...campos, nombre: e.target.value })} required />
            </div>
            <div>
              <div className="fieldLabel">Sede <span className="required">*</span></div>
              <select className="select" value={campos.sedeId} onChange={(e) => setCampos({ ...campos, sedeId: e.target.value })} required>
                {sedes.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
            </div>
            <div>
              <div className="fieldLabel">Especialidad</div>
              <select className="select" value={campos.especialidadId} onChange={(e) => setCampos({ ...campos, especialidadId: e.target.value })}>
                <option value="">Sin especialidad</option>
                {especialidades.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
              </select>
            </div>
            <div>
              <div className="fieldLabel">Médico Asignado</div>
              <select className="select" value={campos.medicoId} onChange={(e) => setCampos({ ...campos, medicoId: e.target.value })}>
                <option value="">Sin asignar</option>
                {medicos.map((m) => <option key={m.id} value={m.id}>{m.nombres} {m.apellidos}</option>)}
              </select>
            </div>
          </>
        )}
        payloadDeCampos={(campos) => campos}
        onGuardar={async (payload, item) => {
          if (item) await updateConsultorio(item.id, payload);
          else await createConsultorio(payload);
          refrescarConsultorios();
        }}
        onClose={() => setModalConsultorio(undefined)}
      />
    </div>
  );
}
