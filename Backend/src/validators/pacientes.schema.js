const { z } = require('zod');

const TIPOS_DOCUMENTO = ['CC', 'CE', 'PA', 'TI', 'RC', 'PE', 'PPT'];
const SEXOS = ['masculino', 'femenino', 'intersexual'];
const ESTADOS_CIVILES = ['soltero', 'casado', 'union_libre', 'separado', 'divorciado', 'viudo'];
const GRUPOS_SANGUINEOS = ['A', 'B', 'AB', 'O'];
const RH = ['positivo', 'negativo'];
const REGIMENES = ['contributivo', 'subsidiado', 'especial', 'particular'];
const ZONAS = ['urbana', 'rural'];

const opcional = (schema) => schema.optional().or(z.literal('')).transform((v) => (v ? v : undefined));

const contactoSchema = z.object({
  nombre: z.string().trim().min(2).max(120),
  parentesco: z.string().trim().min(2).max(60),
  telefono: z.string().trim().min(5).max(30),
  direccion: opcional(z.string().trim().max(160)),
});

const baseFields = {
  tipoDocumento: z.enum(TIPOS_DOCUMENTO),
  numeroDocumento: z.string().trim().min(4).max(30),
  nombres: z.string().trim().min(2).max(100),
  apellidos: z.string().trim().min(2).max(100),
  fechaNacimiento: z.coerce.date().max(new Date(), 'La fecha de nacimiento no puede ser futura'),
  sexo: z.enum(SEXOS),
  estadoCivil: opcional(z.enum(ESTADOS_CIVILES)),
  ocupacion: opcional(z.string().trim().max(100)),
  grupoSanguineo: opcional(z.enum(GRUPOS_SANGUINEOS)),
  rh: opcional(z.enum(RH)),
  telefono: z.string().trim().min(5).max(30),
  correo: opcional(z.string().trim().email()),
  direccion: z.string().trim().min(3).max(160),
  municipio: z.string().trim().min(2).max(80),
  zona: z.enum(ZONAS).default('urbana'),
  epsId: z.string().cuid(),
  regimen: z.enum(REGIMENES),
  nroAfiliacion: opcional(z.string().trim().max(40)),
  sedeRegistroId: opcional(z.string().cuid()),
  activo: z.boolean().default(true),
  contactos: z.array(contactoSchema).max(10).default([]),
};

const createPacienteSchema = z.object(baseFields);
const updatePacienteSchema = z.object(baseFields);

const estadoSchema = z.object({
  activo: z.boolean(),
  motivo: z.string().trim().max(255).optional(),
});

module.exports = {
  TIPOS_DOCUMENTO,
  SEXOS,
  ESTADOS_CIVILES,
  GRUPOS_SANGUINEOS,
  RH,
  REGIMENES,
  ZONAS,
  createPacienteSchema,
  updatePacienteSchema,
  estadoSchema,
};
