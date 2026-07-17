const ExcelJS = require('exceljs');
const prisma = require('../config/prisma');

const ROLES_CLINICOS = ['medico-general', 'psiquiatra', 'psicologo', 'neuropsicologo', 'odontologo', 'nutricionista'];

function rangoMes(fecha) {
  const inicio = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
  const fin = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 1);
  return { inicio, fin };
}

function pctCambio(actual, anterior) {
  if (!anterior) return actual > 0 ? 100 : 0;
  return Math.round(((actual - anterior) / anterior) * 100);
}

async function contarAtenciones(inicio, fin) {
  return prisma.atencion.count({ where: { fecha: { gte: inicio, lt: fin }, estado: { not: 'anulada' } } });
}

async function sumarIngresos(inicio, fin) {
  const r = await prisma.pago.aggregate({ _sum: { valor: true }, where: { createdAt: { gte: inicio, lt: fin } } });
  return Number(r._sum.valor ?? 0);
}

// Proporción de citas del período que no terminaron canceladas/sin asistir
// (proxy de "ocupación de agenda"; no modelamos horarios/cupos disponibles).
async function ocupacionAgenda(inicio, fin, sedeId) {
  const [total, activas] = await Promise.all([
    prisma.cita.count({ where: { inicio: { gte: inicio, lt: fin }, ...(sedeId ? { sedeId } : {}) } }),
    prisma.cita.count({
      where: { inicio: { gte: inicio, lt: fin }, estado: { notIn: ['cancelada', 'no_asistio'] }, ...(sedeId ? { sedeId } : {}) },
    }),
  ]);
  return total > 0 ? Math.round((activas / total) * 100) : 0;
}

async function getIndicadores({ desde, hasta } = {}) {
  const hoy = new Date();
  let rangoActual;
  if (desde && hasta) {
    const fin = new Date(hasta);
    fin.setDate(fin.getDate() + 1);
    rangoActual = { inicio: new Date(desde), fin };
  } else {
    rangoActual = rangoMes(hoy);
  }
  const duracionMs = rangoActual.fin - rangoActual.inicio;
  const rangoAnterior = { inicio: new Date(rangoActual.inicio.getTime() - duracionMs), fin: rangoActual.inicio };

  const [atencionesMes, atencionesAnterior, ingresosMes, ingresosAnterior, ocupacionActual, ocupacionAnterior] = await Promise.all([
    contarAtenciones(rangoActual.inicio, rangoActual.fin),
    contarAtenciones(rangoAnterior.inicio, rangoAnterior.fin),
    sumarIngresos(rangoActual.inicio, rangoActual.fin),
    sumarIngresos(rangoAnterior.inicio, rangoAnterior.fin),
    ocupacionAgenda(rangoActual.inicio, rangoActual.fin),
    ocupacionAgenda(rangoAnterior.inicio, rangoAnterior.fin),
  ]);

  const medicos = await prisma.user.findMany({
    where: { activo: true, rol: { slug: { in: ROLES_CLINICOS } } },
    select: { id: true, nombres: true, apellidos: true, cargoProfesion: true },
  });
  const conteos = await Promise.all(
    medicos.map((m) => contarAtencionesDeMedico(m.id, rangoActual.inicio, rangoActual.fin)),
  );
  const maxConteo = Math.max(1, ...conteos, 0);
  const productividadPorMedico = medicos
    .map((m, i) => ({
      nombre: `${m.nombres} ${m.apellidos} · ${m.cargoProfesion}`,
      atenciones: conteos[i],
      pct: Math.round((conteos[i] / maxConteo) * 100),
    }))
    .sort((a, b) => b.atenciones - a.atenciones);

  const productividadPromedio = medicos.length ? Math.round((atencionesMes / medicos.length) * 10) / 10 : 0;
  const productividadPromedioAnterior = medicos.length ? Math.round((atencionesAnterior / medicos.length) * 10) / 10 : 0;

  const mesesBase = [5, 4, 3, 2, 1, 0].map((i) => new Date(hoy.getFullYear(), hoy.getMonth() - i, 1));
  const conteosMeses = await Promise.all(mesesBase.map((base) => {
    const { inicio, fin } = rangoMes(base);
    return contarAtenciones(inicio, fin);
  }));
  const maxMes = Math.max(1, ...conteosMeses);
  const atencionesPorMes = mesesBase.map((base, i) => ({
    label: base.toLocaleDateString('es-CO', { month: 'short' }).replace('.', ''),
    cantidad: conteosMeses[i],
    pct: Math.round((conteosMeses[i] / maxMes) * 100),
  }));

  const sedes = await prisma.sede.findMany({ where: { activa: true } });
  const sedesReporte = await Promise.all(sedes.map(async (sede) => {
    const [facturacion, recaudo, ocupacion] = await Promise.all([
      prisma.factura.aggregate({
        _sum: { total: true },
        where: { sedeId: sede.id, estado: { in: ['emitida', 'pagada'] }, fecha: { gte: rangoActual.inicio, lt: rangoActual.fin } },
      }),
      prisma.pago.aggregate({
        _sum: { valor: true },
        where: { factura: { sedeId: sede.id }, createdAt: { gte: rangoActual.inicio, lt: rangoActual.fin } },
      }),
      ocupacionAgenda(rangoActual.inicio, rangoActual.fin, sede.id),
    ]);
    const facturacionNum = Number(facturacion._sum.total ?? 0);
    const recaudoNum = Number(recaudo._sum.valor ?? 0);
    return { nombre: sede.nombre, facturacion: facturacionNum, recaudo: recaudoNum, cartera: facturacionNum - recaudoNum, ocupacion };
  }));

  return {
    periodo: { desde: rangoActual.inicio, hasta: new Date(rangoActual.fin.getTime() - 86400000) },
    kpis: {
      atencionesMes,
      atencionesTrend: pctCambio(atencionesMes, atencionesAnterior),
      ingresosMes,
      ingresosTrend: pctCambio(ingresosMes, ingresosAnterior),
      ocupacionAgenda: ocupacionActual,
      ocupacionTrend: ocupacionActual - ocupacionAnterior,
      productividadPromedio,
      productividadTrend: pctCambio(productividadPromedio, productividadPromedioAnterior),
    },
    atencionesPorMes,
    productividadPorMedico,
    sedesReporte,
  };
}

async function contarAtencionesDeMedico(medicoId, inicio, fin) {
  return prisma.atencion.count({ where: { medicoId, fecha: { gte: inicio, lt: fin }, estado: { not: 'anulada' } } });
}

async function exportarExcel({ desde, hasta } = {}) {
  const datos = await getIndicadores({ desde, hasta });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'HealthCore';

  const resumen = workbook.addWorksheet('Resumen');
  resumen.columns = [{ header: 'Indicador', key: 'k', width: 30 }, { header: 'Valor', key: 'v', width: 20 }];
  resumen.addRows([
    { k: 'Atenciones (período)', v: datos.kpis.atencionesMes },
    { k: 'Ingresos (período)', v: datos.kpis.ingresosMes },
    { k: 'Ocupación de Agenda (%)', v: datos.kpis.ocupacionAgenda },
    { k: 'Productividad Promedio (atenciones/médico)', v: datos.kpis.productividadPromedio },
  ]);

  const productividad = workbook.addWorksheet('Productividad por Médico');
  productividad.columns = [
    { header: 'Médico', key: 'nombre', width: 40 },
    { header: 'Atenciones', key: 'atenciones', width: 15 },
  ];
  productividad.addRows(datos.productividadPorMedico);

  const sedesSheet = workbook.addWorksheet('Reporte por Sede');
  sedesSheet.columns = [
    { header: 'Sede', key: 'nombre', width: 25 },
    { header: 'Facturación', key: 'facturacion', width: 18 },
    { header: 'Recaudo', key: 'recaudo', width: 18 },
    { header: 'Cartera', key: 'cartera', width: 18 },
    { header: 'Ocupación (%)', key: 'ocupacion', width: 15 },
  ];
  sedesSheet.addRows(datos.sedesReporte);

  return workbook;
}

module.exports = { getIndicadores, exportarExcel };
