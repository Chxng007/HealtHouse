import { useRef, useState } from 'react';
import styles from '../../styles/users/InfoUsuarioSection.module.css';
import { TIPOS_DOCUMENTO } from '../../constants/tiposDocumento';
import { CARGOS } from '../../constants/cargos';
import Toggle from '../common/Toggle';

const DEFAULT_AVATAR = 'https://i.pravatar.cc/240?img=47';

function formatFecha(iso) {
  if (!iso) return 'Se generará al guardar';
  return new Date(iso).toLocaleString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function InfoUsuarioSection({
  values,
  onChange,
  roles,
  isEditMode,
  createdAt,
  fotoPreview,
  onFotoSelect,
}) {
  const fileInputRef = useRef(null);
  const [editingPassword, setEditingPassword] = useState(!isEditMode);
  const [showPassword, setShowPassword] = useState(false);

  function handleField(name) {
    return (e) => onChange(name, e.target.value);
  }

  function handleFotoClick() {
    fileInputRef.current?.click();
  }

  function handleFotoChange(e) {
    const file = e.target.files?.[0];
    if (file) onFotoSelect(file);
  }

  return (
    <section className="card" style={{ padding: '22px 26px 26px 26px' }}>
      <div className={`sectionHeader ${styles.headerRow}`}>
        <div className="sectionIconBadge">
          <span className="msr" style={{ fontSize: 20, color: 'var(--color-primary)' }}>person</span>
        </div>
        <h2 className="sectionTitle">Información del Usuario</h2>
      </div>

      <div className={styles.gridTop}>
        <div className={styles.fotoRow}>
          <div className="fieldLabel">Foto de Perfil</div>
          <div className={styles.fotoWrap}>
            <img src={fotoPreview || DEFAULT_AVATAR} alt="Foto de perfil" className={styles.fotoImg} />
            <button type="button" className={styles.fotoCameraBtn} onClick={handleFotoClick}>
              <span className="msr" style={{ fontSize: 17, color: 'var(--text-secondary)' }}>photo_camera</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={handleFotoChange}
            />
          </div>
        </div>

        <div>
          <div className="fieldLabel">Nombres <span className="required">*</span></div>
          <input
            type="text"
            className="input"
            value={values.nombres}
            onChange={handleField('nombres')}
            required
          />
        </div>
        <div>
          <div className="fieldLabel">Apellidos <span className="required">*</span></div>
          <input
            type="text"
            className="input"
            value={values.apellidos}
            onChange={handleField('apellidos')}
            required
          />
        </div>

        <div>
          <div className="fieldLabel">Tipo de Documento <span className="required">*</span></div>
          <div className={styles.selectWrap}>
            <select className="select" value={values.tipoDocumento} onChange={handleField('tipoDocumento')}>
              {TIPOS_DOCUMENTO.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <span className={`msr ${styles.selectChevron}`}>expand_more</span>
          </div>
        </div>
        <div>
          <div className="fieldLabel">Número de Documento <span className="required">*</span></div>
          <input
            type="text"
            className="input"
            value={values.numeroDocumento}
            onChange={handleField('numeroDocumento')}
            required
          />
        </div>
      </div>

      <div className={styles.gridMiddle}>
        <div>
          <div className="fieldLabel">Correo Electrónico <span className="required">*</span></div>
          <input
            type="email"
            className="input"
            value={values.correo}
            onChange={handleField('correo')}
            required
          />
        </div>
        <div>
          <div className="fieldLabel">Teléfono</div>
          <input type="text" className="input" value={values.telefono} onChange={handleField('telefono')} />
        </div>
        <div>
          <div className="fieldLabel">Cargo / Profesión <span className="required">*</span></div>
          <div className={styles.selectWrap}>
            <select className="select" value={values.cargoProfesion} onChange={handleField('cargoProfesion')}>
              {CARGOS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <span className={`msr ${styles.selectChevron}`}>expand_more</span>
          </div>
        </div>
        <div>
          <div className="fieldLabel">Rol del Usuario <span className="required">*</span></div>
          <div className={styles.selectWrap}>
            <span className={`msr ${styles.selectIconLeft}`}>manage_accounts</span>
            <select
              className={`select ${styles.selectWithIcon}`}
              value={values.rolId}
              onChange={handleField('rolId')}
            >
              <option value="" disabled>Seleccione un rol</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.nombre}</option>
              ))}
            </select>
            <span className={`msr ${styles.selectChevron}`}>expand_more</span>
          </div>
        </div>
      </div>

      <div className={styles.gridBottom}>
        <div>
          <div className="fieldLabel">Estado del Usuario</div>
          <Toggle checked={values.activo} onChange={(v) => onChange('activo', v)} />
        </div>
        <div>
          <div className="fieldLabel">Fecha de Creación</div>
          <div className={styles.fechaCreacion}>
            <span className="msr msr-outline" style={{ fontSize: 17 }}>calendar_today</span>
            {formatFecha(createdAt)}
          </div>
        </div>
        <div>
          <div className="fieldLabel">Contraseña <span className="required">*</span></div>
          <div className={styles.passwordRow}>
            <div className={styles.passwordInputWrap}>
              <input
                type={showPassword ? 'text' : 'password'}
                className={`input ${styles.passwordInput}`}
                value={values.password}
                onChange={handleField('password')}
                disabled={!editingPassword}
                placeholder={isEditMode && !editingPassword ? '••••••••••••' : ''}
                required={!isEditMode}
              />
              <span
                className={`msr msr-outline ${styles.passwordToggleIcon}`}
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? 'visibility' : 'visibility_off'}
              </span>
            </div>
            {isEditMode && !editingPassword && (
              <button
                type="button"
                className={styles.changePasswordLink}
                onClick={() => setEditingPassword(true)}
              >
                Cambiar contraseña
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
