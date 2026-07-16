# HANDOFF — Estado del proyecto y qué falta (2026-07-16)

Documento para retomar el desarrollo en otra máquina/sesión sin contexto previo.
Leer junto con: [PLAN-IMPLEMENTACION.md](PLAN-IMPLEMENTACION.md) (plan aprobado de las 10 fases) y `../DESARROLLO.md` (bitácora detallada de lo hecho).

## Cómo levantar en una máquina nueva

```bash
docker compose up -d          # Postgres 16. OJO: puerto 5434 (en la máquina original 5432 y 5433 están ocupados por un Postgres nativo de Windows; ajustar docker-compose.yml y Backend/.env si en la nueva máquina 5434 está libre u ocupado)
cd Backend
# Crear Backend/.env (está gitignoreado). Contenido:
#   DATABASE_URL="postgresql://healthcore:healthcore@localhost:5434/healthcore_dev"
#   PORT=4000
#   CORS_ORIGIN="http://localhost:5173"
npm install
npx prisma migrate deploy     # aplica las 6 migraciones
npx prisma generate
npx prisma db seed            # idempotente: roles, sedes, admin, 15 EPS, 8 pacientes, especialidades, consultorios, 2 médicos, 9 citas demo, 80 CIE-10
npm run dev                   # API en :4000
cd ../Frontend && npm install && npm run dev   # App en :5173
```

Credenciales demo: admin `admin@healthhouse.co / Admin12345`; médicos `torres@healthhouse.co` y `vargas@healthhouse.co` / `Demo12345`. No hay login todavía (decisión de alcance).

## Estado: COMPLETADO y verificado end-to-end

| Fase | Módulo | Commit |
|---|---|---|
| — | Usuarios (crear/editar, falta listado) | 39e8f50 |
| 0 | Reorganización CSS → `Frontend/src/styles/<area>/` | bace4aa |
| 1 | **Pacientes** (lista+KPIs+filtros, formulario, perfil con tabs, búsqueda sin acentos vía `unaccent`) | c23fcab |
| 2 | **Agenda** (calendario día/semana/mes, anti-solape GiST + servicio, máquina de estados, reprogramación) | c83f3a7 |
| 3 | **Admisiones** (wizard 5 pasos, lista de espera, sincronización admisión↔cita) | dc8ac6a |
| 4 | Historia Clínica — **SOLO migración + seed CIE-10 aplicados** (modelos `Cie10`, `Atencion`, `SignosVitales`, `AtencionDiagnostico`; 80 códigos sembrados). Falta TODO el backend y frontend. | este commit |

Primitivas UI ya construidas y reutilizables (`Frontend/src/components/common/` + `styles/common/`): `DataTable` (paginación servidor), `Modal`, `ConfirmDialog`, `EstadoBadge`, `Tabs`, `Toggle`, `SearchSelect` (autocomplete async). Utilidades: `utils/formato.js` (documento/fecha), `utils/fechas.js` (semana/mes/horas es-CO).

## Qué falta (en orden; detalle completo en PLAN-IMPLEMENTACION.md)

### Fase 4 — Historia Clínica (EN CURSO, solo falta código)
Mockup: `Historia Clinica.dc.html` (leer vía DesignSync, proyecto `5e1ee8b8-0b03-4662-aad7-0759527a4c95`). Ya visto: banda de paciente con badge "Consulta en Curso" + botón Guardar; cards Motivo/Anamnesis (textareas), Signos Vitales (7 campos: TA "118/76", FC, Temp, Peso, Talla, IMC auto, SatO2), Examen Físico, Diagnósticos CIE-10 (tabla CÓDIGO/DESCRIPCIÓN/TIPO/CONDICIÓN, condición badge Confirmado verde / Impresión Dx amarillo, botón "Agregar Diagnóstico"), Plan de Manejo; panel lateral Trazabilidad (timeline) + banner azul "No se permite eliminar registros clínicos, solo anular con justificación (Res. 3100 de 2019)".

Pendiente:
- **Backend**: `validators/atenciones.schema.js`, `services/historiaClinica.service.js` (guard central `assertEditable` — update solo si `en_curso`; crear desde admisión valida pertenencia y pasa admisión a `en_atencion`; IMC calculado en servicio desde peso/talla; cerrar → `cerrada`+`cerradaAt` y admisión→`atendido`/cita→`atendida`; anular exige motivo; SIN rutas DELETE), `controllers/atenciones.controller.js` (auditoría en cada escritura), `routes/atenciones.routes.js`: `GET /api/atenciones?pacienteId`, `GET /:id`, `GET /:id/trazabilidad` (lee `audit_logs` entidad=Atencion), `POST /`, `PUT /:id`, `POST /:id/cerrar`, `PATCH /:id/anular`. Thin: `GET /api/cie10?search=` (por código o descripción). Editar cerrada/anulada → 409.
- **Frontend**: `constants/hce.js`, `api/historiaClinica.api.js` + `cie10.api.js`; `pages/HistoriaClinicaPage.jsx` (`/historia-clinica`: SearchSelect paciente → timeline de atenciones + botón Nueva Atención con modal médico/sede/admisión-pendiente/motivo) y `pages/AtencionPage.jsx` (`/historia-clinica/atencion/:id`, secciones del mockup, solo-lectura si cerrada/anulada); CSS en `styles/historia-clinica/`; registrar rutas en `App.jsx` (`IMPLEMENTED_PATHS` += `/historia-clinica`) y breadcrumb en `pageHeader.js`.
- **Conectar lo que quedó esperando esto**: `pacientes.service.getHistorial()` (hoy devuelve `[]`) → atenciones reales {fecha, medico, tipo, diagnóstico principal, factura:null}; KPI `atencionesSemana` en `getStats()` (hoy 0); columna "Última Atención" de la lista de pacientes.
- **Verificación** (patrón de las fases anteriores, scripts en el scratchpad de la sesión — rehacerlos es rápido): smoke API con curl/node (crear desde admisión, editar, cerrar → editar 409, anular sin motivo 400, DELETE no existe) + Playwright headless (npm i playwright en un dir temporal; flujo completo con cero errores de consola) + lint + build.

### Fases 5-10 (no iniciadas)
Seguir PLAN-IMPLEMENTACION.md al pie de la letra; para cada una: leer su mockup `.dc.html` con DesignSync ANTES de escribir JSX, colores nuevos → tokens en `styles/tokens.css`, CSS en `styles/<modulo>/`, backend con la plantilla 4 capas de usuarios/pacientes, verificar con smoke+Playwright, actualizar DESARROLLO.md y commit por fase.

5. **Fórmulas y Órdenes** — migración (Cups + seed ~80, Formula/FormulaItem, Orden/OrdenItem, Remision, Incapacidad, Consentimiento con firma PNG vía multer); emitir/anular; impresión con `PrintLayout` + `styles/common/print.css` (`@media print` + `window.print()`, sin librería PDF). Ruta `/formulas-ordenes`.
6. **Facturación + Caja** — migración (Convenio, Tarifa, Servicio, NumeracionFactura, Factura/FacturaItem, NotaFactura, Pago, CierreCaja, **Configuracion** clave/valor con datos IPS); numeración transaccional al emitir; Siigo/DIAN = stub marcado (`estadoDian='pendiente_emision'`); estados borrador→emitida→pagada/anulada/en_glosa. Rutas `/facturacion`, `/caja-pagos`.
7. **RIPS** — migración RipsExport; generar JSON Res. 2275/2023 (usuarios+consultas+procedimientos) desde facturas del periodo; validación pre-envío con errores estructurados; descarga .json. Ruta `/rips`.
8. **Parametrización + Sedes/Consultorios** — CRUD de catálogos (EPS, Especialidades, Servicios, Convenios, Tarifas, CUPS); Sede += direccion/telefono/codigoHabilitacion/horarios Json. Rutas `/administracion/parametrizacion`, `/administracion/sedes-consultorios`.
9. **Roles y Permisos + Auditoría + listado Usuarios** — RolePermission (plantillas por rol), visor de audit_logs con filtros, `AuditLog += ip`, y la deuda del listado `/usuarios` (el `GET /api/usuarios` ya existe).
10. **Dashboard + Reportes + Configuración** — KPIs con groupBy, export Excel (`exceljs`, única dependencia nueva), gráficos SVG propios; al final `/` redirige a `/dashboard` y no queda ningún `ComingSoonPage`.

## Convenciones críticas (resumen)

- Backend CommonJS, 4 capas: validator zod (`baseFields` spread) → service (todo Prisma, `$transaction`, errores de dominio `Object.assign(new Error(msg), {status:409})`) → controller (`safeParse` inline → 400 `{error, detalles}`; `writeAuditLog(prisma, {accion SCREAMING_SNAKE, entidad, entidadId, detalle})`) → routes montadas en `src/routes/index.js`.
- Listados paginados: `GET ?search=&page=&pageSize=` → `{data, total, page, pageSize}`.
- `errorHandler.js` ya mapea: P2002→409, P2025→404, P2003→400, constraint `sin_solape`/23P01→409, `err.status` pasa directo.
- Frontend: páginas en `pages/`, componentes por módulo en `components/<modulo>/`, **CSS SIEMPRE en `styles/<modulo>/`** (decisión del usuario, no co-ubicado), constantes `{value,label}` en `constants/`, API en `api/<modulo>.api.js` sobre `api/client.js`.
- Los seeds viven en `prisma/seedData/*.js` y todo upsert es idempotente.
- Máquinas de estados: transiciones validadas en servicio → 409 con mensaje claro.
