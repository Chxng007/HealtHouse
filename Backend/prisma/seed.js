const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { EPS } = require('./seedData/eps');
const { PACIENTES } = require('./seedData/pacientes');

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
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
