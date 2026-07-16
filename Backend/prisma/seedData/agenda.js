const ESPECIALIDADES = [
  'Medicina General',
  'Psicología',
  'Psiquiatría',
  'Neuropsicología',
  'Odontología',
  'Nutrición y Dietética',
  'Trabajo Social',
  'Fisioterapia',
  'Fonoaudiología',
  'Terapia Ocupacional',
];

// Consultorios por sede. medicoCorreo/especialidad se resuelven al sembrar.
const CONSULTORIOS = [
  { nombre: 'Consultorio 1', sedeNombre: 'Sede Principal', especialidad: 'Medicina General', medicoCorreo: 'vargas@healthhouse.co' },
  { nombre: 'Consultorio 2', sedeNombre: 'Sede Principal', especialidad: 'Psicología', medicoCorreo: 'torres@healthhouse.co' },
  { nombre: 'Consultorio 3', sedeNombre: 'Sede Principal', especialidad: 'Odontología', medicoCorreo: null },
  { nombre: 'Consultorio 1', sedeNombre: 'Sede Norte', especialidad: 'Medicina General', medicoCorreo: null },
  { nombre: 'Consultorio 2', sedeNombre: 'Sede Norte', especialidad: 'Nutrición y Dietética', medicoCorreo: null },
  { nombre: 'Consultorio 1', sedeNombre: 'Sede Bocagrande', especialidad: 'Psicología', medicoCorreo: null },
];

// Médicos demo (users con rol clínico) para poder agendar citas.
const MEDICOS = [
  {
    correo: 'torres@healthhouse.co',
    nombres: 'Laura',
    apellidos: 'Torres',
    tipoDocumento: 'CC',
    numeroDocumento: '52111222',
    cargoProfesion: 'Psicóloga',
    rolSlug: 'psicologo',
  },
  {
    correo: 'vargas@healthhouse.co',
    nombres: 'Andrés',
    apellidos: 'Vargas',
    tipoDocumento: 'CC',
    numeroDocumento: '79333444',
    cargoProfesion: 'Médico General',
    rolSlug: 'medico-general',
  },
];

module.exports = { ESPECIALIDADES, CONSULTORIOS, MEDICOS };
