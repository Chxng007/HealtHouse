# HealthCore — Bitácora de Desarrollo

Documento vivo que registra el avance real del proyecto (qué se hizo, en qué orden, y por qué). Se actualiza a medida que se implementa. Para el plan original y las decisiones de arquitectura, ver el DRF (`DRF_Plataforma_IPS_v1_0_APA.pdf`) y el resumen de decisiones más abajo.

## Stack y decisiones fijadas

- Backend: Node.js + Express 5, PostgreSQL, **Prisma ORM** (migraciones versionadas).
- Frontend: React 19 + Vite, **CSS plano / CSS Modules** (sin Tailwind ni librería de componentes).
- Alcance de esta iteración: **CRUD de usuarios** (RF-ADM-01/02/03), sin login/JWT todavía. Contraseñas hasheadas con `bcryptjs`.
- Postgres corre en **Docker** (`docker-compose.yml` en la raíz).
- Diseño fuente de verdad: pantalla "Crear / Editar Usuario" importada desde Claude Design (proyecto `5e1ee8b8-0b03-4662-aad7-0759527a4c95`, archivo `Gestion de Usuarios.dc.html`).
- Plan detallado completo: `C:\Users\USUARIO\.claude\plans\use-the-claude-design-mcp-cozy-parrot.md`.

## Avance

### 2026-07-14

- [x] Explorado el repo: `Backend/` solo tenía `package.json` con `express`; `Frontend/` era el scaffold default de Vite+React. Nada de DB, router ni estilos existía.
- [x] Leído el mockup completo de "Crear / Editar Usuario" vía Claude Design MCP (paleta, tipografía, roles, permisos y sedes exactos).
- [x] Plan de implementación aprobado por el usuario (Prisma, solo CRUD sin auth, CSS plano, Docker).
- [x] Creado `docker-compose.yml` en la raíz (Postgres 16, DB `healthcore_dev`).
- [x] Creado `Backend/.env`, `.env.example`, `.gitignore`, `Backend/uploads/fotos/.gitkeep`.
- [x] Instaladas dependencias backend: `@prisma/client`, `bcryptjs`, `cors`, `multer`, `zod`, `dotenv` (+ dev: `prisma`).
- [x] Docker Desktop iniciado y `docker compose up -d` corriendo Postgres 16.
- [x] **Incidente:** `npx prisma init` instaló por defecto **Prisma 7.8.0**, que genera el cliente en **TypeScript puro** (`generated/prisma/*.ts`) vía el nuevo generador `prisma-client` + `prisma.config.ts`. El backend es JS plano (sin `tsx`/`ts-node`), así que el cliente generado no se podía `require()`. Se desinstaló (`npm uninstall prisma @prisma/client`), se borraron `generated/` y `prisma.config.ts`, y se fijó la versión estable **`prisma@6.19.3` / `@prisma/client@6.19.3`** (generador clásico `prisma-client-js`, cliente CommonJS en `node_modules/@prisma/client`). El schema y las migraciones ya escritas eran SQL estándar y no hubo que rehacerlas.
- [x] **Incidente:** al correr la primera migración, `docker compose` publicaba Postgres en el puerto **5432**, pero ese puerto ya estaba ocupado por una instancia **nativa de PostgreSQL** corriendo como servicio de Windows en esta máquina (proceso `postgres`, distinto del contenedor). Las conexiones desde Prisma caían en esa instancia nativa (con otras credenciales) y fallaban con `P1000 Authentication failed`. Se remapeó el contenedor al puerto **5433** (`docker-compose.yml` y `.env` actualizados) sin tocar la instancia nativa existente.
- [x] Prisma schema completo escrito (`Role`, `Sede`, `User`, `UserSede`, `UserPermission`, `AuditLog`) y migración inicial aplicada (`prisma/migrations/20260715032241_init`).
- [x] `prisma/seed.js`: 12 roles, 5 sedes (Cartagena/Norte/Bocagrande/Turbaco/Manga), 1 usuario admin semilla (`admin@healthhouse.co` / `Admin12345`, con permisos completos en los 6 módulos).
- [x] Backend completo: `src/config` (env con zod, prisma singleton, multer para fotos), `src/middleware` (validate, notFound, errorHandler con mapeo de errores Prisma P2002/P2025/P2003), `src/utils/audit.js`, `src/validators/usuarios.schema.js` (zod), `src/services/usuarios.service.js` (transacciones para reemplazar permisos/sedes en cada update), `src/controllers` y `src/routes` de roles/sedes/usuarios, `src/app.js`/`src/index.js`.
- [x] Verificado end-to-end por `curl`: `GET /health`, `GET /api/roles` (12), `GET /api/sedes` (5), `POST /api/usuarios` (multipart, crea usuario con permisos y sede), `GET /api/usuarios/:id` (confirma que `passwordHash` no se expone), `PATCH /api/usuarios/:id/estado` (desactivar), y 2 filas nuevas en `audit_logs` (`CREAR_USUARIO`, `DESACTIVAR_USUARIO`).
- [x] Frontend shell: `react-router-dom` instalado, proxy de Vite (`/api`, `/uploads` → `:4000`), Google Fonts en `index.html`, `styles/tokens.css` (paleta completa) + `styles/global.css` (primitivas compartidas: `.card`, `.input`, `.select`, `.btn*`, `.sectionHeader`, etc.), `Sidebar`/`Topbar`/`AppLayout` (12 ítems de nav fieles al mockup, submenú "Administración" con 5 hijos), `ComingSoonPage` para los módulos aún no construidos. Se limpió el demo default de Vite (`App.css`, `index.css`, contenido de `App.jsx`).
- [x] Formulario "Crear / Editar Usuario" completo: capa `api/` (`client.js` + `roles.api.js`/`sedes.api.js`/`usuarios.api.js`), constantes (`tiposDocumento`, `cargos`, `permisosModulos`), componente común `Toggle`, y las 5 secciones del mockup (`InfoUsuarioSection` con foto/contraseña/estado, `PermisosRapidosSection`, `AsignacionRolSection` con las 12 tarjetas de rol desde la API, `SedesPermitidasSection`, `InfoAdicionalSection` solo en modo edición) + `UserFormTabs` + `UserFormFooter`, orquestados por `UserForm.jsx` y cargados/hidratados por `UserFormPage.jsx`.
- [x] `npm run lint` (oxlint) del frontend: sin errores.
- [x] **Verificación end-to-end en navegador real** (Playwright headless, ya que no había `chromium-cli` disponible — se instaló `playwright` en el scratchpad de la sesión, reutilizando el Chromium ya cacheado en la máquina): se abrió `/usuarios/nuevo`, se confirmó que roles y sedes se cargan desde la API (no hardcodeados), se llenó el formulario completo (datos, rol, sede, contraseña) y se guardó → navegó a `/usuarios/:id/editar` con "Fecha de Creación" real e "Información Adicional" mostrando los datos correctos. Se confirmó en la base de datos que la contraseña quedó hasheada con bcrypt (60 caracteres) y que se crearon las 6 filas de permisos y la fila de sede. Se probó también "Desactivar Usuario" (cambia a "Inactivo", badge "Inactiva", botón pasa a "Activar Usuario") y quedó registrado en `audit_logs`. Se probó la navegación a un módulo no construido (Pacientes) confirmando que muestra `ComingSoonPage` sin romper la app. **Cero errores de consola** en todo el recorrido.

## Cómo levantar el proyecto

```bash
docker compose up -d                  # Postgres 16 en localhost:5433
cd Backend && npm run dev             # API en http://localhost:4000
cd Frontend && npm run dev            # App en http://localhost:5173 (proxy a la API)
```

Usuario admin semilla: `admin@healthhouse.co` / `Admin12345` (no hay login todavía, es solo para referencia futura).

## Próximos pasos sugeridos

- Construir los demás módulos del DRF (Pacientes, Agenda, HCE, etc.), reutilizando el mismo patrón: modelo Prisma → endpoints con zod/servicio/transacción → página React con secciones en CSS Modules.
- Agregar login/JWT y proteger rutas cuando el negocio lo requiera (decisión ya tomada de dejarlo fuera de esta iteración).
- Construir un listado de usuarios (`/usuarios`) — hoy solo existe crear/editar; el endpoint `GET /api/usuarios` ya existe en el backend.
