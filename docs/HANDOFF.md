# HANDOFF — Estado del proyecto (2026-07-17) — LAS 10 FASES ESTÁN COMPLETAS

Documento para retomar el desarrollo en otra máquina/sesión sin contexto previo.
Leer junto con: [PLAN-IMPLEMENTACION.md](PLAN-IMPLEMENTACION.md) (plan aprobado de las 10 fases, ya ejecutado por completo) y `../DESARROLLO.md` (bitácora detallada de lo hecho, fase por fase).

**Las 10 fases del plan están implementadas y verificadas.** No queda ningún módulo pendiente ni ningún `ComingSoonPage` activo en el sidebar. Lo que sigue en este documento es el estado final para referencia — no hay "próxima fase" que retomar salvo las ideas de la sección final de `DESARROLLO.md` (login/JWT, catálogos completos, integraciones externas reales).

## Cómo levantar en una máquina nueva (para un compañero de equipo)

Cada persona corre su propia copia local (su propio Postgres en Docker, su propia API, su propio frontend) — no dependen de que la máquina de otro esté prendida. Se necesita tener instalado: Git, Node.js, Docker Desktop.

```bash
git clone https://github.com/Chxng007/HealtHouse
cd HealtHouse

docker compose up -d          # Postgres 16. OJO: puerto 5434 (si en esa máquina ya está ocupado —por ejemplo por un Postgres nativo de Windows—, ajustar el mapeo de puertos en docker-compose.yml y usar ese mismo puerto en Backend/.env)
cd Backend
# Crear Backend/.env (no viene en el clone, está en .gitignore). Contenido:
#   DATABASE_URL="postgresql://healthcore:healthcore@localhost:5434/healthcore_dev"
#   PORT=4000
#   CORS_ORIGIN="http://localhost:5173"
npm install
npx prisma migrate deploy     # aplica todas las migraciones (init, pacientes, agenda, admisiones, historia_clinica, formulas_ordenes, facturacion_caja, rips, parametrizacion_sedes, roles_auditoria)
npx prisma generate
npx prisma db seed            # idempotente: roles, sedes, admin, 15 EPS, 8 pacientes, especialidades, consultorios, 2 médicos, 9 citas demo, 80 CIE-10, 85 CUPS, 15 servicios + 7 convenios/tarifas, numeraciones FE/RC, Configuracion IPS + preferencias generales
npm run dev                   # API en http://localhost:4000

# en otra terminal, sin cerrar la anterior:
cd HealtHouse/Frontend
npm install
npm run dev                   # App en http://localhost:5173
```

Con eso, abriendo `http://localhost:5173` ya ve la aplicación completa con los mismos datos demo.

Credenciales demo: admin `admin@healthhouse.co / Admin12345`; médicos `torres@healthhouse.co` y `vargas@healthhouse.co` / `Demo12345`. No hay login todavía (decisión de alcance).

**Para ver la base de datos directamente** (tablas crudas, no la app): desde `Backend/`, correr `npx prisma studio` y abrir `http://localhost:5555`. **No** se puede abrir el puerto de Postgres (5434) directamente en el navegador — ese puerto habla el protocolo binario de Postgres, no HTTP, por eso da un error tipo "esta página no funciona"/`ERR_EMPTY_RESPONSE` si se intenta.

## Estado: COMPLETADO y verificado end-to-end

| Fase | Módulo | Commit |
|---|---|---|
| — | Usuarios (crear/editar, falta listado) | 39e8f50 |
| 0 | Reorganización CSS → `Frontend/src/styles/<area>/` | bace4aa |
| 1 | **Pacientes** (lista+KPIs+filtros, formulario, perfil con tabs, búsqueda sin acentos vía `unaccent`) | c23fcab |
| 2 | **Agenda** (calendario día/semana/mes, anti-solape GiST + servicio, máquina de estados, reprogramación) | c83f3a7 |
| 3 | **Admisiones** (wizard 5 pasos, lista de espera, sincronización admisión↔cita) | dc8ac6a |
| 4 | **Historia Clínica** (migración `Cie10`/`Atencion`/`SignosVitales`/`AtencionDiagnostico` + seed 80 CIE-10, backend `atenciones` 4 capas con `assertEditable`/cerrar/anular/trazabilidad, catálogo `cie10` thin, frontend timeline + `AtencionPage` por secciones, historial de paciente + KPI + "Última Atención" conectados) | sin commit (ver nota abajo) |
| 5 | **Fórmulas y Órdenes** (migración `Cups`/`Formula`/`Orden`/`Remision`/`Incapacidad`/`Consentimiento` + seed 85 CUPS, backend 4 capas por tipo con factory `crudDocumento()`, `PrintLayout`+`print.css` genéricos, `SignaturePad` canvas→PNG, frontend `DocumentoTab` genérico + `ConsentimientoTab`) | sin commit (ver nota abajo) |
| 6 | **Facturación + Caja** (migración `Convenio`/`Servicio`/`Tarifa`/`NumeracionFactura`/`Factura`+`Item`/`NotaFactura`/`Pago`/`CierreCaja`/`Configuracion`, numeración transaccional `FE`/`RC`, máquina de estados borrador→emitida→pagada/anulada/en_glosa, stub DIAN, `PrintLayout` ya lee `Configuracion`) | sin commit (ver nota abajo) |
| 7 | **RIPS** (migración `RipsExport`, generación JSON Res. 2275/2023 subconjunto representativo desde facturas reales, validaciones estructuradas, descarga `.json` sin librería) | sin commit (ver nota abajo) |
| 8 | **Parametrización + Sedes/Consultorios** (CRUD completo de EPS/Especialidades/Servicios/Convenios/Tarifas/CUPS, `Sede` con dirección/teléfono/habilitación/horarios y elevada a 4 capas, `CatalogoTab` genérico reutilizado en 4 de los 6 catálogos) | sin commit (ver nota abajo) |
| 9 | **Roles y Permisos + Auditoría + listado Usuarios** (`RolePermission` + "aplicar plantilla a usuario", `AuditLog.ip` capturado vía `AsyncLocalStorage` sin tocar los ~14 controllers existentes, visor de auditoría con filtros dinámicos, `UsuariosListPage` cierra la deuda histórica) | sin commit (ver nota abajo) |
| 10 | **Dashboard + Reportes + Configuración** (KPIs reales con tendencia vs. período anterior, gráficos en CSS puro, export Excel real vía `exceljs`, `/` redirige a `/dashboard`, cero `ComingSoonPage` restantes) | sin commit (ver nota abajo) |

Primitivas UI ya construidas y reutilizables (`Frontend/src/components/common/` + `styles/common/`): `DataTable` (paginación servidor), `Modal`, `ConfirmDialog`, `EstadoBadge`, `Tabs`, `Toggle`, `SearchSelect` (autocomplete async). Utilidades: `utils/formato.js` (documento/fecha), `utils/fechas.js` (semana/mes/horas es-CO).

## Qué falta (en orden; detalle completo en PLAN-IMPLEMENTACION.md)

### Fases 4-10: COMPLETAS (plan cerrado)
Ver `DESARROLLO.md` (entradas "2026-07-16 — Fase 4" a "Fase 8", "2026-07-17 — Fase 9" y "Fase 10 — ÚLTIMA FASE DEL PLAN") para el detalle de lo implementado y verificado en cada una. **Nota:** por pedido del usuario no se hizo `git commit` de ninguna de estas fases — todo el código queda en el working tree para que él lo commitee/pushee manualmente.

**Nota sobre migraciones** (útil si se retoma con una migración nueva en el futuro): en este entorno `npx prisma migrate dev` falla con "environment is non-interactive" apenas hay cualquier warning. Workaround (usado en Fases 8 y 9): generar el SQL con `prisma migrate diff --from-schema-datasource prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma --script`, crear a mano `prisma/migrations/<timestamp>_<nombre>/migration.sql` con ese SQL, y aplicar con `prisma migrate deploy` (no interactivo) + `prisma generate`. Detener el proceso del backend en el puerto 4000 antes del `generate` (si no, EPERM renombrando el `.dll` del query engine en Windows) y reiniciarlo después.

### Ideas para una futura iteración (no son deuda del plan)
Ver la sección final de `DESARROLLO.md` ("Próximos pasos sugeridos"): login/JWT, catálogos CIE-10/CUPS completos, integraciones externas reales (Siigo/DIAN, SMS/email, backups), CRUD de roles en sí.

## Convenciones críticas (resumen)

- Backend CommonJS, 4 capas: validator zod (`baseFields` spread) → service (todo Prisma, `$transaction`, errores de dominio `Object.assign(new Error(msg), {status:409})`) → controller (`safeParse` inline → 400 `{error, detalles}`; `writeAuditLog(prisma, {accion SCREAMING_SNAKE, entidad, entidadId, detalle})`) → routes montadas en `src/routes/index.js`.
- Listados paginados: `GET ?search=&page=&pageSize=` → `{data, total, page, pageSize}`.
- `errorHandler.js` ya mapea: P2002→409, P2025→404, P2003→400, constraint `sin_solape`/23P01→409, `err.status` pasa directo.
- Frontend: páginas en `pages/`, componentes por módulo en `components/<modulo>/`, **CSS SIEMPRE en `styles/<modulo>/`** (decisión del usuario, no co-ubicado), constantes `{value,label}` en `constants/`, API en `api/<modulo>.api.js` sobre `api/client.js`.
- Los seeds viven en `prisma/seedData/*.js` y todo upsert es idempotente.
- Máquinas de estados: transiciones validadas en servicio → 409 con mensaje claro.
