# HealthCore — Implementación de los 16 módulos restantes del DRF

## Contexto

El módulo "Crear/Editar Usuario" ya está construido y verificado end-to-end. El proyecto de Claude Design (`5e1ee8b8-0b03-4662-aad7-0759527a4c95`) contiene 17 mockups; quedan 16 por implementar. El DRF (documento de requerimientos firmado) define el alcance funcional de cada módulo. Decisiones del usuario:

1. **Orden**: flujo asistencial primero (Pacientes → Agenda → Admisiones → HCE → Fórmulas → Facturación/Caja → RIPS), luego administración, y al final Dashboard/Reportes/Configuración.
2. **CSS**: reorganizar TODOS los `.module.css` fuera de las carpetas de componentes, a `Frontend/src/styles/<area>/` (subcarpetas por módulo). `tokens.css` y `global.css` quedan en la raíz de `styles/`.
3. **Integraciones externas** (Siigo/DIAN, SMS/email): modeladas en BD con estados reales, la llamada externa queda como stub marcado (`// STUB`).
4. Sin login/JWT todavía (decisión previa). Catálogos CUPS/CIE-10: subconjunto representativo (~80 códigos c/u) con upsert por código listo para import completo.

## Convenciones (heredadas del módulo usuarios)

- **Backend por módulo** (plantilla = usuarios): `validators/<m>.schema.js` (zod, baseFields spread) → `services/<m>.service.js` (todo Prisma, `$transaction` multi-tabla) → `controllers/<m>.controller.js` (safeParse inline, 400 `{error, detalles}`, `writeAuditLog` en escrituras) → `routes/<m>.routes.js` montado en `routes/index.js`. Catálogos de solo lectura pueden ser thin (estilo roles/sedes).
- **Listados nuevos**: `GET /api/<r>?search=&page=&pageSize=` → `{data, total, page, pageSize}`.
- **Frontend por módulo**: `api/<m>.api.js` (usa `client.js`), `pages/<M>Page.jsx`, `components/<m>/*.jsx`, CSS en `styles/<m>/*.module.css`, constantes en `constants/`.
- **[App.jsx](Frontend/src/App.jsx)**: refactorizar `flattenComingSoonPaths()` para filtrar contra lista `IMPLEMENTED_PATHS`; cada fase agrega su ruta real.
- **errorHandler.js**: agregar mapeo `23P01` (exclusion constraint → 409) y error de dominio `ConflictError` (409) para transiciones de estado inválidas / inmutabilidad HCE.
- **Enum `ModuloPermiso`**: extender en la migración de la fase que introduce el módulo; sincronizar `constants/permisosModulos.js`.
- **Seeds**: `prisma/seed.js` idempotente (upsert); datos grandes en `prisma/seedData/{eps,especialidades,cie10,cups,tarifas}.js`.
- **Fidelidad al diseño**: ANTES de escribir JSX de un módulo, leer su mockup con `DesignSync get_file` (proyecto `5e1ee8b8-...`, archivo `<Modulo>.dc.html`); extraer labels/estados/columnas exactos y mapear colores a `tokens.css` (agregar token si falta, no hardcodear).
- **Cerrar cada fase**: actualizar `DESARROLLO.md` + commit.

## Fase 0 — Reorganización CSS (sin cambios funcionales)

Mover 13 archivos y actualizar sus imports:
- `styles/layout/`: AppLayout, Sidebar, Topbar (.module.css desde `components/layout/`)
- `styles/common/`: Toggle (desde `components/common/`), ComingSoonPage (desde `pages/`)
- `styles/users/`: los 8 `.module.css` de `components/users/`

Verificar: `npm run lint` + `npm run build` (detecta imports rotos) + recorrer `/usuarios/nuevo` en navegador. Commit aislado.

## Primitivas UI compartidas (construir bajo demanda, mayoría en Fase 1)

En `components/common/` + `styles/common/`: **DataTable** (búsqueda debounce, paginación servidor, slot acciones), **Modal**/**ConfirmDialog**, **EstadoBadge** (mapa estado→color por tokens), **SearchSelect** (autocomplete async — pacientes, CIE-10, CUPS, médicos), **Tabs** (generalizar UserFormTabs). Fechas: inputs nativos `type="date"/"time"` estilizados + `utils/fechas.js` (es-CO); el calendario de Agenda es grilla custom. **Impresión**: `PrintLayout` (encabezado IPS desde Configuracion) + `styles/common/print.css` con `@media print` + `window.print()` — sin librería PDF. Única dependencia nueva: `exceljs` en backend (Fase 10, export Excel).

## Modelo de datos (una migración nombrada por fase)

Enums nuevos: `Sexo, EstadoCivil, GrupoSanguineo, Rh, Regimen, Zona, EstadoCita{agendada,confirmada,en_atencion,atendida,cancelada,no_asistio}, TipoAtencion, EstadoAdmision, EstadoAtencion{en_curso,cerrada,anulada}, TipoDiagnostico, CondicionDiagnostico, EstadoDocumentoClinico{emitido,anulado}, TipoOrden, TipoContrato, EstadoFactura{borrador,emitida,pagada,anulada,en_glosa}, TipoNotaFactura, MetodoPago, EstadoCierreCaja, EstadoRips, CanalRecordatorio, EstadoRecordatorio`. Extender `TipoDocumento` con `RC, PE, PPT` (no usar el valor nuevo en la misma migración que lo crea).

| Migración | Modelos |
|---|---|
| `pacientes` | Eps; Paciente (demografía completa, epsId, regimen, nroAfiliacion, fotoUrl, `@@index([apellidos,nombres])`, numeroDocumento unique); ContactoEmergencia (1..n, cascade) |
| `agenda` | Especialidad; Consultorio (sedeId, especialidadId?, medicoId?); Cita (pacienteId, medicoId, consultorioId, sedeId, inicio/fin, estado, motivos de cancelación/reprogramación, `reprogramadaDeId` self-rel); Recordatorio (stub) |
| `admisiones` | Admision (pacienteId, citaId? unique, tipoAtencion, numeroAutorizacion, estado, horaLlegada) |
| `historia_clinica` | Cie10; Atencion (motivo, anamnesis, antecedentes, examenFisico, planManejo, estado, anuladaMotivo); SignosVitales (1:1, IMC calculado en servicio); AtencionDiagnostico (cie10Id, tipo, condicion) |
| `formulas_ordenes` | Cups; Formula+FormulaItem; Orden+OrdenItem (cupsId); Remision; Incapacidad; Consentimiento (firmaUrl PNG vía multer) |
| `facturacion` | Convenio; Tarifa (`@@unique([convenioId,cupsId])`); Servicio; NumeracionFactura (consecutivo transaccional); Factura+FacturaItem (numero null en borrador, estadoDian stub); NotaFactura; Pago (reciboNumero); CierreCaja; **Configuracion** (clave/valor Json — datos IPS, la necesitan factura y RIPS) |
| `rips` | RipsExport (contenido Json fiel a Res. 2275: usuarios US + consultas AC + procedimientos AP, erroresValidacion Json) |
| `administracion` | Sede += direccion/telefono/codigoHabilitacion/horarios Json; RolePermission (plantilla por rol) |
| `auditoria` | AuditLog += ip; `writeAuditLog` captura `req.ip` |

**Anti-solape de citas (2 capas)**: (a) chequeo en servicio dentro de `$transaction` (mismo médico O consultorio, estado no cancelada/no_asistio, rangos solapados → 409); (b) editar a mano el `migration.sql`: `CREATE EXTENSION IF NOT EXISTS btree_gist` + `EXCLUDE USING gist` sobre (medicoId, tstzrange) y (consultorioId, tstzrange) con WHERE de estados activos. Documentar en el SQL y en DESARROLLO.md.

**Inmutabilidad HCE**: sin rutas DELETE; update solo si `en_curso` (guard central `assertEditable()` en el servicio); `POST /:id/cerrar` y `PATCH /:id/anular` (motivo obligatorio). Editar cerrada/anulada → 409.

**Numeración de factura**: solo al emitir, en `$transaction` (increment de consecutivo + validar rango + componer `PREFIJO-n`). Transiciones validadas en servicio.

## Fases (cada una shippable y verificada antes de seguir)

1. **Pacientes + Perfil** (`Pacientes.dc.html`, `Pacientes - Perfil.dc.html`): migración pacientes; seed ~15 EPS + pacientes demo; backend pacientes (4 capas, multipart foto reutilizando `config/multer.js`, `GET /:id/historial` que se llena en fases 2-4) + eps thin; frontend `PacientesListPage` (DataTable + búsqueda tiempo real), `PacienteFormPage` (contactos de emergencia repetibles), `PacientePerfilPage` (tabs Información/Historial); constantes sexos/estadosCiviles/gruposSanguineos/regimenes/parentescos. Rutas `/pacientes`, `/pacientes/nuevo`, `/pacientes/:id`, `/pacientes/:id/editar`. Aquí se construyen DataTable, Modal, EstadoBadge, SearchSelect, Tabs.
2. **Agenda** (`Agenda.dc.html`): migración agenda + SQL exclusión; seed especialidades + consultorios; endpoints citas (list por rango/filtros, create con validación de solape, reprogramar con motivo, PATCH estado con máquina de estados, recordatorios stub); frontend vistas día/semana/mes custom + `CitaFormModal` + `ReprogramarModal`. Ruta `/agenda`.
3. **Admisiones** (`Admisiones.dc.html`): migración; crear admisión desde cita o walk-in (snapshot EPS/régimen, nro autorización); lista de espera del día por sede; PATCH estados; admitir actualiza estado de la cita en transacción. Ruta `/admisiones`.
4. **Historia Clínica** (`Historia Clinica.dc.html`): migración + seed ~80 CIE-10; historia por paciente (timeline), `AtencionPage` por secciones (signos vitales con IMC auto, diagnósticos con SearchSelect CIE-10 + tipo/condición); cerrar/anular; vista cerrada solo-lectura. Rutas `/historia-clinica`, `/historia-clinica/atencion/:id`. El historial del perfil de paciente (Fase 1) empieza a llenarse.
5. **Fórmulas y Órdenes** (`Formulas y Ordenes.dc.html`): migración + seed ~80 CUPS; rutas separadas formulas/ordenes/remisiones/incapacidades/consentimientos (emitir/anular); `SignaturePad` canvas → PNG multer; impresión con `PrintLayout` (FormulaPrint, OrdenPrint, IncapacidadPrint). Ruta `/formulas-ordenes` + accesos desde la atención.
6. **Facturación + Caja** (`Facturacion.dc.html`, `Caja y Pagos.dc.html`): migración (incluye Configuracion); seed datos IPS + numeración demo + convenios/tarifas/servicios; factura borrador desde admisión (items CUPS valorados por tarifa + copago), emitir (numeración + stub Siigo `estadoDian='pendiente_emision'`), notas crédito/débito, glosa; pagos multi-método con recibo + cierre de caja diario. Rutas `/facturacion`, `/caja-pagos`.
7. **RIPS** (`RIPS.dc.html`): migración; `POST /api/rips/generar {desde,hasta}` (JSON Res. 2275: numDocumentoIdObligado desde Configuracion, usuarios/consultas/procedimientos), validar pre-envío (errores estructurados), descargar .json, enviar stub. Ruta `/rips`.
8. **Parametrización + Sedes y Consultorios** (`Parametrizacion.dc.html`, `Sedes y Consultorios.dc.html`): migración administracion; CRUD completo de catálogos (EPS, Especialidades, Servicios, Convenios, Tarifas, CUPS con import básico); sedes con campos nuevos + consultorios; elevar `sedes` a 4 capas. Rutas `/administracion/parametrizacion`, `/administracion/sedes-consultorios`.
9. **Roles y Permisos + Auditoría + listado Usuarios** (`Roles y Permisos.dc.html`, `Auditoria.dc.html`): migración auditoria (ip); matriz RolePermission + "aplicar plantilla a usuario"; visor de auditoría con filtros (actor/entidad/acción/fechas) y detalle Json en Modal; cerrar deuda: `UsuariosListPage` en `/usuarios` (el `GET /api/usuarios` ya existe). Rutas `/administracion/roles-permisos`, `/administracion/auditoria`, `/usuarios`.
10. **Dashboard + Reportes + Configuración** (`Dashboard.dc.html`, `Reportes e Indicadores.dc.html`, `Configuracion.dc.html`): sin migración nueva; `GET /api/dashboard/kpis` (agregaciones Prisma groupBy: atenciones, ingresos, ocupación, productividad por médico); reportes con filtros + export `?formato=xlsx` (**exceljs**) + imprimir; configuración clave-valor. Gráficos en SVG/CSS propio (sin librería). Al cerrar: `/` redirige a `/dashboard`; no queda ningún ComingSoonPage.

## Verificación (por fase)

1. `npx prisma migrate dev --name <fase>` + seed idempotente (correr 2 veces).
2. Curl: happy path de cada endpoint + rechazos clave (solape 409, editar atención cerrada 409, duplicado 409, anular sin motivo 400) + filas en `audit_logs`.
3. `npm run lint` + `npm run build` en Frontend.
4. Playwright headless efímero en scratchpad (patrón ya documentado en DESARROLLO.md): recorrer el flujo del módulo, datos desde API real, **cero errores de consola**.
5. Verificación final (Fase 10): recorrido completo paciente→cita→admisión→atención→fórmula→factura→pago→RIPS→dashboard refleja los números.

## Archivos críticos

- [Backend/prisma/schema.prisma](Backend/prisma/schema.prisma) — todas las migraciones
- [Backend/src/routes/index.js](Backend/src/routes/index.js) — registro de módulos
- Backend/src/{controllers,services,validators}/usuarios.* — plantilla 4 capas
- [Backend/src/middleware/errorHandler.js](Backend/src/middleware/errorHandler.js) — 23P01 + ConflictError
- [Frontend/src/App.jsx](Frontend/src/App.jsx) — rutas + IMPLEMENTED_PATHS
- [Frontend/src/styles/tokens.css](Frontend/src/styles/tokens.css) y global.css — tokens/primitivas
- Frontend/src/components/layout/sidebarConfig.js — los 16 paths ya existen

## Riesgos

- Constraint de exclusión de Agenda requiere editar `migration.sql` a mano (Prisma no la modela).
- `ALTER TYPE ADD VALUE`: no usar el valor nuevo en la misma migración que lo crea.
- Inmutabilidad HCE es de capa servicio (sin triggers): centralizar en `assertEditable()`.
- Stubs externos (Siigo, SMS) en funciones aisladas y marcadas, con estado persistido en BD.
