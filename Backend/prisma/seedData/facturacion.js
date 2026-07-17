// Catálogo representativo de servicios facturables y convenios demo. Las tarifas
// (valor negociado + copago por convenio×servicio) se derivan en el seed a partir
// de estas listas, no se hardcodean aquí.
const SERVICIOS = [
  { codigo: 'CONS-GEN', nombre: 'Consulta Medicina General', valorBase: 45000 },
  { codigo: 'CONS-ESP', nombre: 'Consulta Medicina Especializada', valorBase: 90000 },
  { codigo: 'CONS-PSI', nombre: 'Consulta Psicología', valorBase: 70000 },
  { codigo: 'CONS-PSQ', nombre: 'Consulta Psiquiatría', valorBase: 120000 },
  { codigo: 'CONS-NUT', nombre: 'Consulta Nutrición y Dietética', valorBase: 60000 },
  { codigo: 'CONS-ODO', nombre: 'Consulta Odontología', valorBase: 55000 },
  { codigo: 'PROC-CUR', nombre: 'Curación de Heridas', valorBase: 25000 },
  { codigo: 'PROC-NEB', nombre: 'Nebulización', valorBase: 20000 },
  { codigo: 'PROC-INY', nombre: 'Inyectología', valorBase: 15000 },
  { codigo: 'LAB-HEMO', nombre: 'Hemograma Completo', valorBase: 35000 },
  { codigo: 'LAB-QUIM', nombre: 'Química Sanguínea Básica', valorBase: 40000 },
  { codigo: 'LAB-TSH', nombre: 'Perfil Tiroideo (TSH)', valorBase: 45000 },
  { codigo: 'IMG-RXTX', nombre: 'Radiografía de Tórax', valorBase: 65000 },
  { codigo: 'IMG-ECO', nombre: 'Ecografía Abdominal', valorBase: 110000 },
  { codigo: 'URG-CONS', nombre: 'Consulta de Urgencias', valorBase: 85000 },
];

// tipoContrato: evento (paga valor pleno + copago pequeño), capitacion (tarifa
// negociada con descuento, sin copago), paquete (tarifa combinada intermedia).
const CONVENIOS = [
  { epsNombre: 'Nueva EPS', tipoContrato: 'evento' },
  { epsNombre: 'Sura', tipoContrato: 'evento' },
  { epsNombre: 'Sura', tipoContrato: 'capitacion' },
  { epsNombre: 'Sanitas', tipoContrato: 'evento' },
  { epsNombre: 'Sanitas', tipoContrato: 'capitacion' },
  { epsNombre: 'Coosalud', tipoContrato: 'paquete' },
  { epsNombre: 'Particular / Sin EPS', tipoContrato: 'evento' },
];

const NUMERACIONES = [
  { prefijo: 'FE', consecutivo: 0, rangoDesde: 1, rangoHasta: 999999 },
  { prefijo: 'RC', consecutivo: 0, rangoDesde: 1, rangoHasta: 999999 },
];

const CONFIGURACION_IPS = {
  clave: 'ips',
  valor: {
    nombre: 'HealthCore IPS',
    nit: '900.123.456-7',
    direccion: 'Cra. 3 # 25-10, Cartagena de Indias',
    telefono: '(605) 300 0000',
    codigoHabilitacion: '130010812301',
    sedePrincipal: 'Sede Principal',
  },
};

module.exports = { SERVICIOS, CONVENIOS, NUMERACIONES, CONFIGURACION_IPS };
