// Claves de Configuracion usadas por la página /configuracion (Fase 10). La clave
// 'ips' se siembra aparte en seedData/facturacion.js (la necesitaban Factura y RIPS
// desde la Fase 6); estas son las demás preferencias generales de la plataforma.
const CONFIGURACIONES_GENERALES = [
  { clave: 'general', valor: { zonaHoraria: 'America/Bogota', idioma: 'es-CO' } },
  { clave: 'seguridad', valor: { bloqueoIntentos: true, forzarHttps: true, expiracionPassword: false, registroAuditoria: true } },
  { clave: 'notificaciones', valor: { recordatorioEmail: true, recordatorioSms: false, alertasGlosaCartera: true } },
  { clave: 'backup', valor: { frecuencia: 'Diaria, 2:00 a.m.', retencion: '30 días', ultimaCopia: null, estado: 'Exitosa' } },
];

module.exports = { CONFIGURACIONES_GENERALES };
