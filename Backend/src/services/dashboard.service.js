const prisma = require('../config/prisma');

const ICONO_POR_ENTIDAD = {
  User: { icon: 'person_add', color: '#16a34a' },
  Atencion: { icon: 'edit_note', color: '#2563eb' },
  Factura: { icon: 'receipt_long', color: '#d97706' },
  Cita: { icon: 'event', color: '#7c3aed' },
  Paciente: { icon: 'groups', color: '#2563eb' },
  Admision: { icon: 'how_to_reg', color: '#db2777' },
  RipsExport: { icon: 'description', color: '#0284c7' },
};

function tiempoRelativo(fecha) {
  const ms = Date.now() - new Date(fecha).getTime();
  const minutos = Math.round(ms / 60000);
  if (minutos < 1) return 'Hace instantes';
  if (minutos < 60) return `Hace ${minutos} min`;
  const horas = Math.round(minutos / 60);
  if (horas < 24) return `Hace ${horas} h`;
  const dias = Math.round(horas / 24);
  return `Hace ${dias} d`;
}

async function getKpis() {
  const inicioHoy = new Date();
  inicioHoy.setHours(0, 0, 0, 0);
  const finHoy = new Date(inicioHoy);
  finHoy.setDate(finHoy.getDate() + 1);

  const [citasHoy, pacientesActivos, listaEspera, pagosHoy, proximasCitas, actividadReciente] = await Promise.all([
    prisma.cita.count({ where: { inicio: { gte: inicioHoy, lt: finHoy }, estado: { notIn: ['cancelada'] } } }),
    prisma.paciente.count({ where: { activo: true } }),
    prisma.admision.count({ where: { estado: 'en_espera' } }),
    prisma.pago.aggregate({ _sum: { valor: true }, where: { createdAt: { gte: inicioHoy, lt: finHoy } } }),
    prisma.cita.findMany({
      where: { inicio: { gte: inicioHoy, lt: finHoy }, estado: { notIn: ['cancelada', 'no_asistio'] } },
      include: {
        paciente: { select: { nombres: true, apellidos: true, fotoUrl: true } },
        medico: { select: { nombres: true, apellidos: true } },
        consultorio: { select: { nombre: true } },
      },
      orderBy: { inicio: 'asc' },
      take: 8,
    }),
    prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 8 }),
  ]);

  return {
    citasHoy,
    pacientesActivos,
    recaudoCajaHoy: pagosHoy._sum.valor ?? 0,
    listaEspera,
    proximasCitas: proximasCitas.map((c) => ({
      id: c.id,
      hora: c.inicio,
      paciente: `${c.paciente.nombres} ${c.paciente.apellidos}`,
      fotoUrl: c.paciente.fotoUrl,
      medico: `${c.medico.nombres} ${c.medico.apellidos}`,
      consultorio: c.consultorio.nombre,
      estado: c.estado,
    })),
    actividadReciente: actividadReciente.map((a) => ({
      id: a.id,
      texto: `${a.accion.replaceAll('_', ' ')} · ${a.entidad}`,
      tiempo: tiempoRelativo(a.createdAt),
      ...(ICONO_POR_ENTIDAD[a.entidad] ?? { icon: 'info', color: '#64748b' }),
    })),
  };
}

module.exports = { getKpis };
