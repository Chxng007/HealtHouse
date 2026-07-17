const prisma = require('../config/prisma');

function conflicto(mensaje) {
  return Object.assign(new Error(mensaje), { status: 409 });
}

// Transiciones manuales vía PATCH /:id/estado. "pagada" solo se alcanza al
// registrar un pago que cubre el total (ver registrarPago); "emitida" solo
// mediante emitirFactura (asigna numeración).
const TRANSICIONES = {
  borrador: ['anulada'],
  emitida: ['anulada', 'en_glosa'],
  en_glosa: ['anulada'],
  pagada: [],
  anulada: [],
};

const facturaInclude = {
  paciente: { select: { id: true, nombres: true, apellidos: true, tipoDocumento: true, numeroDocumento: true } },
  convenio: { select: { id: true, tipoContrato: true, eps: { select: { id: true, nombre: true } } } },
  sede: { select: { id: true, nombre: true } },
  items: { include: { servicio: true } },
  notas: { orderBy: { createdAt: 'desc' } },
  pagos: { orderBy: { createdAt: 'desc' } },
};

async function siguienteNumero(tx, prefijo) {
  const numeracion = await tx.numeracionFactura.findUniqueOrThrow({ where: { prefijo } });
  if (!numeracion.activa) throw conflicto(`La numeración "${prefijo}" no está activa.`);
  const consecutivo = numeracion.consecutivo + 1;
  if (consecutivo > numeracion.rangoHasta) throw conflicto(`Rango de numeración "${prefijo}" agotado.`);
  await tx.numeracionFactura.update({ where: { prefijo }, data: { consecutivo } });
  return `${prefijo}-${String(consecutivo).padStart(6, '0')}`;
}

async function listFacturas({ estado, search, page = 1, pageSize = 10 } = {}) {
  const filters = [];
  if (estado) filters.push({ estado });
  if (search) {
    filters.push({
      OR: [
        { numero: { contains: search, mode: 'insensitive' } },
        { paciente: { nombres: { contains: search, mode: 'insensitive' } } },
        { paciente: { apellidos: { contains: search, mode: 'insensitive' } } },
      ],
    });
  }
  const where = filters.length ? { AND: filters } : undefined;
  const skip = (page - 1) * pageSize;

  const [data, total] = await prisma.$transaction([
    prisma.factura.findMany({ where, include: facturaInclude, orderBy: { fecha: 'desc' }, skip, take: pageSize }),
    prisma.factura.count({ where }),
  ]);
  return { data, total, page, pageSize };
}

async function getFactura(id) {
  return prisma.factura.findUniqueOrThrow({ where: { id }, include: facturaInclude });
}

async function getStats() {
  const inicioHoy = new Date();
  inicioHoy.setHours(0, 0, 0, 0);
  const finHoy = new Date(inicioHoy);
  finHoy.setDate(finHoy.getDate() + 1);

  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);

  const [facturadoHoy, pendientes, enGlosa, emitidasMes] = await Promise.all([
    prisma.factura.aggregate({
      _sum: { total: true },
      where: { fecha: { gte: inicioHoy, lt: finHoy }, estado: { in: ['emitida', 'pagada', 'en_glosa'] } },
    }),
    prisma.factura.aggregate({ _sum: { total: true }, where: { estado: { in: ['emitida', 'en_glosa'] } } }),
    prisma.factura.aggregate({ _sum: { total: true }, where: { estado: 'en_glosa' } }),
    prisma.factura.count({ where: { fecha: { gte: inicioMes }, estado: { in: ['emitida', 'pagada', 'en_glosa'] } } }),
  ]);

  return {
    facturadoHoy: facturadoHoy._sum.total ?? 0,
    pendienteCobrar: pendientes._sum.total ?? 0,
    enGlosa: enGlosa._sum.total ?? 0,
    emitidasMes,
  };
}

async function createFactura(data) {
  return prisma.$transaction(async (tx) => {
    const tarifas = await tx.tarifa.findMany({
      where: { convenioId: data.convenioId, servicioId: { in: data.items.map((i) => i.servicioId) } },
      include: { servicio: true },
    });
    const tarifaPorServicio = new Map(tarifas.map((t) => [t.servicioId, t]));

    const itemsData = data.items.map((item) => {
      const tarifa = tarifaPorServicio.get(item.servicioId);
      if (!tarifa) {
        throw conflicto(`No hay tarifa configurada para este servicio en el convenio seleccionado.`);
      }
      return {
        servicioId: item.servicioId,
        cantidad: item.cantidad,
        valorUnitario: tarifa.valor,
        valorTotal: Number(tarifa.valor) * item.cantidad,
      };
    });

    const subtotal = itemsData.reduce((acc, i) => acc + i.valorTotal, 0);
    const copago = data.items.reduce((acc, item) => acc + Number(tarifaPorServicio.get(item.servicioId).copago), 0);

    return tx.factura.create({
      data: {
        pacienteId: data.pacienteId,
        admisionId: data.admisionId ?? null,
        convenioId: data.convenioId,
        sedeId: data.sedeId,
        subtotal,
        copago,
        total: subtotal,
        items: { create: itemsData },
      },
      include: facturaInclude,
    });
  });
}

async function emitirFactura(id) {
  return prisma.$transaction(async (tx) => {
    const factura = await tx.factura.findUniqueOrThrow({ where: { id } });
    if (factura.estado !== 'borrador') {
      throw conflicto(`Solo se pueden emitir facturas en borrador (esta está "${factura.estado}").`);
    }
    const numero = await siguienteNumero(tx, 'FE');
    return tx.factura.update({
      where: { id },
      data: { numero, estado: 'emitida' },
      include: facturaInclude,
    });
  });
}

async function setEstadoFactura(id, estado, motivo) {
  const factura = await prisma.factura.findUniqueOrThrow({ where: { id } });
  if (!TRANSICIONES[factura.estado].includes(estado)) {
    throw conflicto(`Transición inválida: de "${factura.estado}" no se puede pasar a "${estado}".`);
  }
  return prisma.factura.update({
    where: { id },
    data: {
      estado,
      ...(estado === 'anulada' ? { anuladaMotivo: motivo, anuladaAt: new Date() } : {}),
      ...(estado === 'en_glosa' ? { glosaMotivo: motivo ?? null } : {}),
    },
    include: facturaInclude,
  });
}

async function crearNotaFactura(facturaId, data) {
  const factura = await prisma.factura.findUniqueOrThrow({ where: { id: facturaId } });
  if (!['emitida', 'en_glosa', 'pagada'].includes(factura.estado)) {
    throw conflicto(`No se pueden crear notas para una factura en estado "${factura.estado}".`);
  }
  await prisma.notaFactura.create({ data: { facturaId, ...data } });
  return getFactura(facturaId);
}

async function registrarPago(facturaId, { metodo, valor }) {
  return prisma.$transaction(async (tx) => {
    const factura = await tx.factura.findUniqueOrThrow({ where: { id: facturaId }, include: { pagos: true } });
    if (!['emitida', 'en_glosa'].includes(factura.estado)) {
      throw conflicto(`No se pueden registrar pagos a una factura en estado "${factura.estado}".`);
    }
    const reciboNumero = await siguienteNumero(tx, 'RC');
    await tx.pago.create({ data: { facturaId, reciboNumero, metodo, valor } });

    const pagado = factura.pagos.reduce((acc, p) => acc + Number(p.valor), 0) + valor;
    if (pagado >= Number(factura.total)) {
      await tx.factura.update({ where: { id: facturaId }, data: { estado: 'pagada' } });
    }
    return tx.factura.findUniqueOrThrow({ where: { id: facturaId }, include: facturaInclude });
  });
}

async function listPagosDeHoy({ sedeId } = {}) {
  const inicio = new Date();
  inicio.setHours(0, 0, 0, 0);
  const fin = new Date(inicio);
  fin.setDate(fin.getDate() + 1);
  return prisma.pago.findMany({
    where: {
      createdAt: { gte: inicio, lt: fin },
      ...(sedeId ? { factura: { sedeId } } : {}),
    },
    include: { factura: { select: { id: true, numero: true, sedeId: true, paciente: { select: { nombres: true, apellidos: true } } } } },
    orderBy: { createdAt: 'desc' },
  });
}

async function getResumenCaja({ sedeId } = {}) {
  const pagos = await listPagosDeHoy({ sedeId });
  const metodos = { efectivo: 0, tarjeta: 0, transferencia: 0 };
  for (const pago of pagos) {
    metodos[pago.metodo] += Number(pago.valor);
  }
  return { metodos, pagos };
}

async function crearCierreCaja({ sedeId, baseInicial, egresos }) {
  return prisma.$transaction(async (tx) => {
    const inicio = new Date();
    inicio.setHours(0, 0, 0, 0);
    const fin = new Date(inicio);
    fin.setDate(fin.getDate() + 1);

    const cierreExistente = await tx.cierreCaja.findFirst({ where: { sedeId, fecha: { gte: inicio, lt: fin } } });
    if (cierreExistente) {
      throw conflicto('La caja de hoy ya fue cerrada para esta sede.');
    }

    const pagosDelDia = await tx.pago.findMany({
      where: { createdAt: { gte: inicio, lt: fin }, cierreCajaId: null, factura: { sedeId } },
    });
    const totalRecaudado = pagosDelDia.reduce((acc, p) => acc + Number(p.valor), 0);
    const totalCaja = baseInicial + totalRecaudado - egresos;

    const cierre = await tx.cierreCaja.create({
      data: { sedeId, baseInicial, totalRecaudado, egresos, totalCaja, estado: 'cerrada', cerradaAt: new Date() },
    });
    await tx.pago.updateMany({ where: { id: { in: pagosDelDia.map((p) => p.id) } }, data: { cierreCajaId: cierre.id } });
    return tx.cierreCaja.findUniqueOrThrow({ where: { id: cierre.id }, include: { sede: true } });
  });
}

module.exports = {
  listFacturas,
  getFactura,
  getStats,
  createFactura,
  emitirFactura,
  setEstadoFactura,
  crearNotaFactura,
  registrarPago,
  listPagosDeHoy,
  getResumenCaja,
  crearCierreCaja,
};
