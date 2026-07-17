const { z } = require('zod');

const epsSchema = z.object({
  codigo: z.string().trim().min(2).max(20),
  nombre: z.string().trim().min(2).max(120),
});

const especialidadSchema = z.object({
  codigo: z.string().trim().min(2).max(20).optional().or(z.literal('')).transform((v) => (v ? v : undefined)),
  nombre: z.string().trim().min(2).max(120),
});

const servicioSchema = z.object({
  codigo: z.string().trim().min(2).max(20),
  nombre: z.string().trim().min(2).max(150),
  valorBase: z.coerce.number().min(0).max(999999999),
});

const cupsSchema = z.object({
  codigo: z.string().trim().min(2).max(20),
  nombre: z.string().trim().min(2).max(200),
});

const convenioSchema = z.object({
  epsId: z.string().cuid(),
  tipoContrato: z.enum(['evento', 'capitacion', 'paquete']),
});

const tarifaSchema = z.object({
  convenioId: z.string().cuid(),
  servicioId: z.string().cuid(),
  valor: z.coerce.number().min(0).max(999999999),
  copago: z.coerce.number().min(0).max(999999999).default(0),
});

const estadoSchema = z.object({ activo: z.boolean() });

const horariosSchema = z.record(z.string(), z.string()).optional();

const sedeSchema = z.object({
  nombre: z.string().trim().min(2).max(150),
  ciudad: z.string().trim().min(2).max(100),
  esPrincipal: z.coerce.boolean().default(false),
  direccion: z.string().trim().max(200).optional().or(z.literal('')).transform((v) => (v ? v : undefined)),
  telefono: z.string().trim().max(30).optional().or(z.literal('')).transform((v) => (v ? v : undefined)),
  codigoHabilitacion: z.string().trim().max(40).optional().or(z.literal('')).transform((v) => (v ? v : undefined)),
  horarios: horariosSchema,
});

const cuidONulo = () =>
  z.string().cuid().nullish().or(z.literal('')).transform((v) => (v ? v : undefined));

const consultorioSchema = z.object({
  nombre: z.string().trim().min(1).max(50),
  sedeId: z.string().cuid(),
  especialidadId: cuidONulo(),
  medicoId: cuidONulo(),
});

module.exports = {
  epsSchema,
  especialidadSchema,
  servicioSchema,
  cupsSchema,
  convenioSchema,
  tarifaSchema,
  estadoSchema,
  sedeSchema,
  consultorioSchema,
};
