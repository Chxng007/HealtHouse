import { useEffect, useRef, useState } from 'react';
import { getEps } from '../../api/eps.api';
import { getSedes } from '../../api/sedes.api';
import { TIPOS_DOCUMENTO } from '../../constants/tiposDocumento';
import {
  ESTADOS_CIVILES,
  GRUPOS_SANGUINEOS,
  REGIMENES,
  RH,
  SEXOS,
  ZONAS,
} from '../../constants/pacientes';
import ContactosEmergenciaSection from './ContactosEmergenciaSection';
import PacienteAvatar from './PacienteAvatar';
import styles from '../../styles/pacientes/PacienteForm.module.css';

const ESTADO_INICIAL = {
  tipoDocumento: 'CC',
  numeroDocumento: '',
  nombres: '',
  apellidos: '',
  fechaNacimiento: '',
  sexo: '',
  estadoCivil: '',
  ocupacion: '',
  grupoSanguineo: '',
  rh: '',
  telefono: '',
  correo: '',
  direccion: '',
  municipio: '',
  zona: 'urbana',
  epsId: '',
  regimen: '',
  nroAfiliacion: '',
  sedeRegistroId: '',
  activo: true,
  contactos: [],
};

function hidratar(paciente) {
  if (!paciente) return ESTADO_INICIAL;
  return {
    ...ESTADO_INICIAL,
    ...Object.fromEntries(
      Object.entries(paciente).filter(([key]) => key in ESTADO_INICIAL && paciente[key] != null),
    ),
    fechaNacimiento: paciente.fechaNacimiento?.slice(0, 10) ?? '',
    contactos: (paciente.contactos ?? []).map(({ nombre, parentesco, telefono, direccion }) => ({
      nombre,
      parentesco,
      telefono,
      direccion: direccion ?? '',
    })),
  };
}

export default function PacienteForm({ mode, paciente, onSubmit, saving, error }) {
  const [form, setForm] = useState(() => hidratar(paciente));
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [epsList, setEpsList] = useState([]);
  const [sedes, setSedes] = useState([]);
  const fileRef = useRef(null);

  useEffect(() => {
    getEps().then(setEpsList).catch(() => setEpsList([]));
    getSedes().then(setSedes).catch(() => setSedes([]));
  }, []);

  useEffect(() => {
    setForm(hidratar(paciente));
    setFoto(null);
    setFotoPreview(null);
  }, [paciente]);

  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  const onFoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFoto(file);
    setFotoPreview(URL.createObjectURL(file));
  };

  const enviar = (e) => {
    e.preventDefault();
    onSubmit(form, foto);
  };

  return (
    <form className={styles.form} onSubmit={enviar}>
      <section className={`card ${styles.card}`}>
        <div className="sectionHeader">
          <div className="sectionIconBadge">
            <span className="msr" style={{ fontSize: 20, color: 'var(--color-primary)' }}>person</span>
          </div>
          <div>
            <h2 className="sectionTitleSm">Información Personal</h2>
            <div className="sectionSubtitle">Datos demográficos del paciente (RF-PAC-01)</div>
          </div>
        </div>

        <div className={styles.fotoFila}>
          {fotoPreview ? (
            <img src={fotoPreview} alt="Foto del paciente" className={styles.fotoPreview} />
          ) : (
            <PacienteAvatar paciente={paciente ?? { nombres: form.nombres, apellidos: form.apellidos }} size={72} />
          )}
          <div>
            <button type="button" className="btn btnGhost" onClick={() => fileRef.current?.click()}>
              <span className="msr" style={{ fontSize: 18 }}>photo_camera</span>
              {mode === 'edit' ? 'Cambiar Foto' : 'Subir Foto'}
            </button>
            <div className={styles.fotoAyuda}>JPG o PNG. Opcional (RF-PAC-05).</div>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFoto} />
          </div>
        </div>

        <div className={styles.grid4}>
          <div>
            <div className="fieldLabel">Tipo de Documento <span className="required">*</span></div>
            <select className="select" value={form.tipoDocumento} onChange={set('tipoDocumento')}>
              {TIPOS_DOCUMENTO.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <div className="fieldLabel">No. de Documento <span className="required">*</span></div>
            <input className="input" value={form.numeroDocumento} onChange={set('numeroDocumento')} placeholder="1.000.000.000" required />
          </div>
          <div>
            <div className="fieldLabel">Nombres <span className="required">*</span></div>
            <input className="input" value={form.nombres} onChange={set('nombres')} placeholder="Nombres" required />
          </div>
          <div>
            <div className="fieldLabel">Apellidos <span className="required">*</span></div>
            <input className="input" value={form.apellidos} onChange={set('apellidos')} placeholder="Apellidos" required />
          </div>
          <div>
            <div className="fieldLabel">Fecha de Nacimiento <span className="required">*</span></div>
            <input className="input" type="date" value={form.fechaNacimiento} onChange={set('fechaNacimiento')} required />
          </div>
          <div>
            <div className="fieldLabel">Sexo <span className="required">*</span></div>
            <select className="select" value={form.sexo} onChange={set('sexo')} required>
              <option value="">Seleccionar…</option>
              {SEXOS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <div className="fieldLabel">Estado Civil</div>
            <select className="select" value={form.estadoCivil} onChange={set('estadoCivil')}>
              <option value="">Seleccionar…</option>
              {ESTADOS_CIVILES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <div className="fieldLabel">Ocupación</div>
            <input className="input" value={form.ocupacion} onChange={set('ocupacion')} placeholder="Ocupación" />
          </div>
          <div>
            <div className="fieldLabel">Grupo Sanguíneo</div>
            <select className="select" value={form.grupoSanguineo} onChange={set('grupoSanguineo')}>
              <option value="">Seleccionar…</option>
              {GRUPOS_SANGUINEOS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
          </div>
          <div>
            <div className="fieldLabel">RH</div>
            <select className="select" value={form.rh} onChange={set('rh')}>
              <option value="">Seleccionar…</option>
              {RH.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
        </div>
      </section>

      <section className={`card ${styles.card}`}>
        <div className="sectionHeader">
          <div className="sectionIconBadge">
            <span className="msr" style={{ fontSize: 20, color: 'var(--color-primary)' }}>home_pin</span>
          </div>
          <div>
            <h2 className="sectionTitleSm">Contacto y Residencia</h2>
            <div className="sectionSubtitle">Datos de contacto y lugar de residencia</div>
          </div>
        </div>
        <div className={styles.grid4}>
          <div>
            <div className="fieldLabel">Teléfono <span className="required">*</span></div>
            <input className="input" value={form.telefono} onChange={set('telefono')} placeholder="300 000 0000" required />
          </div>
          <div>
            <div className="fieldLabel">Correo Electrónico</div>
            <input className="input" type="email" value={form.correo} onChange={set('correo')} placeholder="correo@mail.com" />
          </div>
          <div>
            <div className="fieldLabel">Dirección <span className="required">*</span></div>
            <input className="input" value={form.direccion} onChange={set('direccion')} placeholder="Cra 0 # 0-00" required />
          </div>
          <div>
            <div className="fieldLabel">Municipio <span className="required">*</span></div>
            <input className="input" value={form.municipio} onChange={set('municipio')} placeholder="Municipio" required />
          </div>
          <div>
            <div className="fieldLabel">Zona</div>
            <select className="select" value={form.zona} onChange={set('zona')}>
              {ZONAS.map((z) => <option key={z.value} value={z.value}>{z.label}</option>)}
            </select>
          </div>
        </div>
      </section>

      <section className={`card ${styles.card}`}>
        <div className="sectionHeader">
          <div className="sectionIconBadge">
            <span className="msr" style={{ fontSize: 20, color: 'var(--color-primary)' }}>health_and_safety</span>
          </div>
          <div>
            <h2 className="sectionTitleSm">Información de Aseguramiento</h2>
            <div className="sectionSubtitle">EPS, régimen y afiliación (RF-PAC-03)</div>
          </div>
        </div>
        <div className={styles.grid4}>
          <div>
            <div className="fieldLabel">EPS <span className="required">*</span></div>
            <select className="select" value={form.epsId} onChange={set('epsId')} required>
              <option value="">Seleccionar…</option>
              {epsList.map((eps) => <option key={eps.id} value={eps.id}>{eps.nombre}</option>)}
            </select>
          </div>
          <div>
            <div className="fieldLabel">Régimen <span className="required">*</span></div>
            <select className="select" value={form.regimen} onChange={set('regimen')} required>
              <option value="">Seleccionar…</option>
              {REGIMENES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div>
            <div className="fieldLabel">No. de Afiliación</div>
            <input className="input" value={form.nroAfiliacion} onChange={set('nroAfiliacion')} placeholder="XX-00000000" />
          </div>
          <div>
            <div className="fieldLabel">Sede de Registro</div>
            <select className="select" value={form.sedeRegistroId} onChange={set('sedeRegistroId')}>
              <option value="">Seleccionar…</option>
              {sedes.map((sede) => <option key={sede.id} value={sede.id}>{sede.nombre}</option>)}
            </select>
          </div>
        </div>
      </section>

      <ContactosEmergenciaSection
        contactos={form.contactos}
        onChange={(contactos) => setForm((f) => ({ ...f, contactos }))}
      />

      {error && (
        <div className={styles.error}>
          <span className="msr" style={{ fontSize: 18 }}>error</span> {error}
        </div>
      )}

      <div className={styles.footer}>
        <button type="button" className="btn btnGhost" onClick={() => window.history.back()} disabled={saving}>
          Cancelar
        </button>
        <button type="submit" className="btn btnPrimary" disabled={saving}>
          <span className="msr" style={{ fontSize: 18 }}>save</span>
          {saving ? 'Guardando…' : mode === 'edit' ? 'Guardar Cambios' : 'Registrar Paciente'}
        </button>
      </div>
    </form>
  );
}
