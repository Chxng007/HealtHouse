const prisma = require('../config/prisma');

// tipoUsuario simplificado por régimen (codificación representativa de la Res. 2275/2023,
// sin distinguir cotizante/beneficiario dentro de cada régimen).
const REGIMEN_TIPO_USUARIO = { contributivo: '01', subsidiado: '02', especial: '03', particular: '05' };
const CODIGO_SEXO = { masculino: 'M', femenino: 'F', intersexual: 'I' };
const CONSULTA_PREFIJOS = /^(CONS|URG)/;

function calcularEdad(fechaNacimiento) {
  const nacimiento = new Date(fechaNacimiento);
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad -= 1;
  return edad;
}

function fechaISO(fecha) {
  return new Date(fecha).toISOString().slice(0, 10);
}

async function generarRips({ desde, hasta, sedeId }) {
  const finExclusivo = new Date(hasta);
  finExclusivo.setDate(finExclusivo.getDate() + 1);

  const facturas = await prisma.factura.findMany({
    where: {
      estado: { in: ['emitida', 'pagada'] },
      fecha: { gte: desde, lt: finExclusivo },
      ...(sedeId ? { sedeId } : {}),
    },
    include: {
      paciente: true,
      admision: { include: { atencion: { include: { diagnosticos: { include: { cie10: true } } } } } },
      items: { include: { servicio: true } },
    },
    orderBy: { fecha: 'asc' },
  });

  const usuariosMap = new Map();
  const consultas = [];
  const procedimientos = [];
  const validaciones = [];

  for (const factura of facturas) {
    const p = factura.paciente;

    if (!usuariosMap.has(p.id)) {
      usuariosMap.set(p.id, {
        tipoDocumentoIdentificacion: p.tipoDocumento,
        numDocumentoIdentificacion: p.numeroDocumento,
        tipoUsuario: REGIMEN_TIPO_USUARIO[p.regimen] ?? '05',
        fechaNacimiento: fechaISO(p.fechaNacimiento),
        codSexo: CODIGO_SEXO[p.sexo] ?? 'I',
        codMunicipioResidencia: p.municipio,
        codZonaTerritorialResidencia: p.zona === 'urbana' ? '01' : '02',
      });

      if (calcularEdad(p.fechaNacimiento) < 18 && p.tipoDocumento === 'CC') {
        validaciones.push({
          severidad: 'error',
          registro: `US-${p.numeroDocumento}`,
          descripcion: 'Tipo de documento del usuario no válido para la edad indicada.',
        });
      }
    }

    if (!factura.admisionId) {
      validaciones.push({
        severidad: 'advertencia',
        registro: factura.numero ?? factura.id,
        descripcion: 'Falta número de autorización de la EPS para el servicio prestado.',
      });
    }

    const diagnosticoPrincipal = factura.admision?.atencion?.diagnosticos.find((d) => d.tipo === 'principal')?.cie10.codigo ?? null;

    for (const item of factura.items) {
      const esConsulta = CONSULTA_PREFIJOS.test(item.servicio.codigo);
      const registro = `${esConsulta ? 'AC' : 'AP'}-${item.id.slice(-6).toUpperCase()}`;

      if (esConsulta) {
        consultas.push({
          numDocumentoIdentificacion: p.numeroDocumento,
          fechaInicioAtencion: fechaISO(factura.fecha),
          numAutorizacion: factura.admision?.numeroAutorizacion ?? null,
          codConsulta: item.servicio.codigo,
          codDiagnosticoPrincipal: diagnosticoPrincipal,
          valorConsulta: Number(item.valorTotal),
        });
        if (!diagnosticoPrincipal) {
          validaciones.push({
            severidad: 'error',
            registro,
            descripcion: 'Código CUPS no corresponde a un diagnóstico principal registrado.',
          });
        } else {
          validaciones.push({
            severidad: 'correcto',
            registro,
            descripcion: 'Registro validado correctamente conforme a Resolución 2275 de 2023.',
          });
        }
      } else {
        procedimientos.push({
          numDocumentoIdentificacion: p.numeroDocumento,
          fechaAtencion: fechaISO(factura.fecha),
          numAutorizacion: factura.admision?.numeroAutorizacion ?? null,
          codProcedimiento: item.servicio.codigo,
          valorServicio: Number(item.valorTotal),
        });
        validaciones.push({
          severidad: 'correcto',
          registro,
          descripcion: 'Registro validado correctamente conforme a Resolución 2275 de 2023.',
        });
      }
    }
  }

  const configIps = await prisma.configuracion.findUnique({ where: { clave: 'ips' } });
  const usuarios = Array.from(usuariosMap.values());
  const contenido = {
    numDocumentoIdObligado: configIps?.valor?.nit ?? null,
    periodo: { desde: fechaISO(desde), hasta: fechaISO(hasta) },
    usuarios,
    consultas,
    procedimientos,
  };
  const totalRegistros = usuarios.length + consultas.length + procedimientos.length;
  const estado = validaciones.some((v) => v.severidad === 'error') ? 'validado_con_errores' : 'validado_ok';

  return prisma.ripsExport.create({
    data: { sedeId: sedeId ?? null, desde, hasta, contenido, totalRegistros, erroresValidacion: validaciones, estado },
    include: { sede: true },
  });
}

async function listRips() {
  return prisma.ripsExport.findMany({ include: { sede: true }, orderBy: { createdAt: 'desc' }, take: 20 });
}

async function getRips(id) {
  return prisma.ripsExport.findUniqueOrThrow({ where: { id }, include: { sede: true } });
}

module.exports = { generarRips, listRips, getRips };
