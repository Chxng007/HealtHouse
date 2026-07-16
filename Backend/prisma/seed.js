const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { EPS } = require('./seedData/eps');
const { PACIENTES } = require('./seedData/pacientes');
const { ESPECIALIDADES, CONSULTORIOS, MEDICOS } = require('./seedData/agenda');

const prisma = new PrismaClient();

const ROLES = [
  { slug: 'administrador-sistema', nombre: 'Administrador del Sistema', icono: 'shield_person', color: '#2563eb' },
  { slug: 'coordinador-clinico', nombre: 'Coordinador Clínico', icono: 'diversity_3', color: '#06b6d4' },
  { slug: 'medico-general', nombre: 'Médico General', icono: 'stethoscope', color: '#3b82f6' },
  { slug: 'psiquiatra', nombre: 'Psiquiatra', icono: 'psychiatry', color: '#8b5cf6' },
  { slug: 'psicologo', nombre: 'Psicólogo', icono: 'psychology', color: '#22c55e' },
  { slug: 'neuropsicologo', nombre: 'Neuropsicólogo', icono: 'neurology', color: '#14b8a6' },
  { slug: 'odontologo', nombre: 'Odontólogo', icono: 'dentistry', color: '#f97316' },
  { slug: 'nutricionista', nombre: 'Nutricionista', icono: 'nutrition', color: '#16a34a' },
  { slug: 'trabajador-social', nombre: 'Trabajador Social', icono: 'diversity_1', color: '#ec4899' },
  { slug: 'recepcionista-admisiones', nombre: 'Recepcionista / Admisiones', icono: 'support_agent', color: '#f59e0b' },
  { slug: 'administrativo', nombre: 'Administrativo', icono: 'work', color: '#2563eb' },
  { slug: 'gerencia', nombre: 'Gerencia', icono: 'monitoring', color: '#eab308' },
];

const SEDES = [
  { nombre: 'Sede Principal', ciudad: 'Cartagena', esPrincipal: true },
  { nombre: 'Sede Norte', ciudad: 'Cartagena', esPrincipal: false },
  { nombre: 'Sede Bocagrande', ciudad: 'Cartagena', esPrincipal: false },
  { nombre: 'Sede Turbaco', ciudad: 'Turbaco', esPrincipal: false },
  { nombre: 'Sede Manga', ciudad: 'Cartagena', esPrincipal: false },
];

const MODULOS = ['pacientes', 'historia_clinica', 'agenda', 'formulas_ordenes', 'reportes', 'administracion'];

async function main() {
  for (const rol of ROLES) {
    await prisma.role.upsert({ where: { slug: rol.slug }, update: rol, create: rol });
  }
  console.log(`Roles sembrados: ${ROLES.length}`);

  for (const sede of SEDES) {
    const existente = await prisma.sede.findFirst({ where: { nombre: sede.nombre } });
    if (!existente) {
      await prisma.sede.create({ data: sede });
    }
  }
  console.log(`Sedes sembradas: ${SEDES.length}`);

  const rolAdmin = await prisma.role.findUniqueOrThrow({ where: { slug: 'administrador-sistema' } });
  const sedePrincipal = await prisma.sede.findFirstOrThrow({ where: { esPrincipal: true } });
  const passwordHash = await bcrypt.hash('Admin12345', 10);

  await prisma.user.upsert({
    where: { correo: 'admin@healthhouse.co' },
    update: {},
    create: {
      nombres: 'Admin',
      apellidos: 'Sistema',
      tipoDocumento: 'CC',
      numeroDocumento: '0000000000',
      correo: 'admin@healthhouse.co',
      cargoProfesion: 'Administrador',
      rolId: rolAdmin.id,
      activo: true,
      mustChangePassword: true,
      passwordHash,
      sedes: { create: [{ sedeId: sedePrincipal.id }] },
      permisos: {
        create: MODULOS.map((modulo) => ({
          modulo,
          ver: true,
          crear: true,
          editar: true,
          eliminar: true,
          imprimir: true,
          exportar: true,
        })),
      },
    },
  });
  console.log('Usuario admin semilla: admin@healthhouse.co / Admin12345');

  for (const eps of EPS) {
    await prisma.eps.upsert({ where: { codigo: eps.codigo }, update: { nombre: eps.nombre }, create: eps });
  }
  console.log(`EPS sembradas: ${EPS.length}`);

  for (const { epsNombre, contactos, fechaNacimiento, ...paciente } of PACIENTES) {
    const eps = await prisma.eps.findUniqueOrThrow({ where: { nombre: epsNombre } });
    await prisma.paciente.upsert({
      where: { numeroDocumento: paciente.numeroDocumento },
      update: {},
      create: {
        ...paciente,
        fechaNacimiento: new Date(fechaNacimiento),
        epsId: eps.id,
        sedeRegistroId: sedePrincipal.id,
        contactos: { create: contactos },
      },
    });
  }
  console.log(`Pacientes demo sembrados: ${PACIENTES.length}`);

  for (const nombre of ESPECIALIDADES) {
    await prisma.especialidad.upsert({ where: { nombre }, update: {}, create: { nombre } });
  }
  console.log(`Especialidades sembradas: ${ESPECIALIDADES.length}`);

  const passwordMedico = await bcrypt.hash('Demo12345', 10);
  for (const medico of MEDICOS) {
    const { rolSlug, ...datos } = medico;
    const rol = await prisma.role.findUniqueOrThrow({ where: { slug: rolSlug } });
    await prisma.user.upsert({
      where: { correo: medico.correo },
      update: {},
      create: {
        ...datos,
        rolId: rol.id,
        activo: true,
        mustChangePassword: true,
        passwordHash: passwordMedico,
        sedes: { create: [{ sedeId: sedePrincipal.id }] },
        permisos: {
          create: ['pacientes', 'historia_clinica', 'agenda', 'formulas_ordenes'].map((modulo) => ({
            modulo,
            ver: true,
            crear: true,
            editar: true,
            imprimir: true,
          })),
        },
      },
    });
  }
  console.log(`Médicos demo sembrados: ${MEDICOS.length} (torres/vargas@healthhouse.co / Demo12345)`);

  for (const consultorio of CONSULTORIOS) {
    const sede = await prisma.sede.findFirstOrThrow({ where: { nombre: consultorio.sedeNombre } });
    const especialidad = await prisma.especialidad.findUniqueOrThrow({ where: { nombre: consultorio.especialidad } });
    const medico = consultorio.medicoCorreo
      ? await prisma.user.findUniqueOrThrow({ where: { correo: consultorio.medicoCorreo } })
      : null;
    const existente = await prisma.consultorio.findFirst({
      where: { nombre: consultorio.nombre, sedeId: sede.id },
    });
    if (!existente) {
      await prisma.consultorio.create({
        data: {
          nombre: consultorio.nombre,
          sedeId: sede.id,
          especialidadId: especialidad.id,
          medicoId: medico?.id ?? null,
        },
      });
    }
  }
  console.log(`Consultorios sembrados: ${CONSULTORIOS.length}`);

  // Citas demo: solo si la tabla está vacía (idempotencia simple, las fechas son relativas a hoy).
  const citasExistentes = await prisma.cita.count();
  if (citasExistentes === 0) {
    const torres = await prisma.user.findUniqueOrThrow({ where: { correo: 'torres@healthhouse.co' } });
    const vargas = await prisma.user.findUniqueOrThrow({ where: { correo: 'vargas@healthhouse.co' } });
    const consultorio1 = await prisma.consultorio.findFirstOrThrow({
      where: { nombre: 'Consultorio 1', sedeId: sedePrincipal.id },
    });
    const consultorio2 = await prisma.consultorio.findFirstOrThrow({
      where: { nombre: 'Consultorio 2', sedeId: sedePrincipal.id },
    });
    const pacientesDemo = await prisma.paciente.findMany({ orderBy: { apellidos: 'asc' }, take: 6 });

    const enDia = (offsetDias, hora, minutos = 0) => {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() + offsetDias);
      fecha.setHours(hora, minutos, 0, 0);
      return fecha;
    };
    const media = (fecha) => new Date(fecha.getTime() + 30 * 60 * 1000);

    const citasDemo = [
      { paciente: 0, medico: torres, consultorio: consultorio2, inicio: enDia(0, 9), estado: 'confirmada', motivo: 'Consulta psicología' },
      { paciente: 1, medico: vargas, consultorio: consultorio1, inicio: enDia(0, 10, 30), estado: 'en_atencion', motivo: 'Consulta general' },
      { paciente: 2, medico: torres, consultorio: consultorio2, inicio: enDia(0, 11, 15), estado: 'atendida', motivo: 'Seguimiento' },
      { paciente: 3, medico: vargas, consultorio: consultorio1, inicio: enDia(0, 14), estado: 'agendada', motivo: 'Control' },
      { paciente: 4, medico: torres, consultorio: consultorio2, inicio: enDia(1, 8), estado: 'agendada', motivo: 'Primera vez' },
      { paciente: 5, medico: vargas, consultorio: consultorio1, inicio: enDia(1, 9, 30), estado: 'agendada', motivo: 'Control tensión' },
      { paciente: 0, medico: vargas, consultorio: consultorio1, inicio: enDia(2, 11), estado: 'agendada', motivo: 'Chequeo general' },
      { paciente: 2, medico: torres, consultorio: consultorio2, inicio: enDia(-1, 15), estado: 'no_asistio', motivo: 'Terapia' },
      { paciente: 1, medico: torres, consultorio: consultorio2, inicio: enDia(3, 10), estado: 'cancelada', motivo: 'Terapia', motivoCancelacion: 'El paciente viajó' },
    ];

    for (const cita of citasDemo) {
      await prisma.cita.create({
        data: {
          pacienteId: pacientesDemo[cita.paciente].id,
          medicoId: cita.medico.id,
          consultorioId: cita.consultorio.id,
          sedeId: sedePrincipal.id,
          inicio: cita.inicio,
          fin: media(cita.inicio),
          estado: cita.estado,
          motivo: cita.motivo,
          motivoCancelacion: cita.motivoCancelacion,
        },
      });
    }
    console.log(`Citas demo sembradas: ${citasDemo.length}`);
  } else {
    console.log(`Citas demo omitidas (ya existen ${citasExistentes}).`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
