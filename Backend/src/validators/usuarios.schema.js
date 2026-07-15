const { z } = require('zod');

const TIPOS_DOCUMENTO = ['CC', 'CE', 'PA', 'TI'];
const MODULOS_PERMISO = [
  'pacientes',
  'historia_clinica',
  'agenda',
  'formulas_ordenes',
  'reportes',
  'administracion',
];

const permisoSchema = z.object({
  modulo: z.enum(MODULOS_PERMISO),
  ver: z.boolean().default(false),
  crear: z.boolean().default(false),
  editar: z.boolean().default(false),
  eliminar: z.boolean().default(false),
  imprimir: z.boolean().default(false),
  exportar: z.boolean().default(false),
});

const baseFields = {
  nombres: z.string().trim().min(2).max(100),
  apellidos: z.string().trim().min(2).max(100),
  tipoDocumento: z.enum(TIPOS_DOCUMENTO),
  numeroDocumento: z.string().trim().min(4).max(30),
  correo: z.string().trim().email(),
  telefono: z.string().trim().max(30).optional().or(z.literal('')).transform((v) => (v ? v : undefined)),
  cargoProfesion: z.string().trim().min(2).max(100),
  rolId: z.string().cuid(),
  activo: z.boolean().default(true),
  mustChangePassword: z.boolean().default(true),
  sedeIds: z.array(z.string().cuid()).min(1, 'Seleccione al menos una sede'),
  permisos: z.array(permisoSchema).max(MODULOS_PERMISO.length),
};

const createUserSchema = z.object({
  ...baseFields,
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

const updateUserSchema = z.object({
  ...baseFields,
  password: z.string().min(8).optional().or(z.literal('')).transform((v) => (v ? v : undefined)),
});

const estadoSchema = z.object({
  activo: z.boolean(),
  motivo: z.string().trim().max(255).optional(),
});

module.exports = {
  TIPOS_DOCUMENTO,
  MODULOS_PERMISO,
  createUserSchema,
  updateUserSchema,
  estadoSchema,
};
