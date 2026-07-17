const { z } = require('zod');

const PRIORIDADES_ORDEN = ['rutinaria', 'prioritaria'];

const opcional = (schema) => schema.optional().or(z.literal('')).transform((v) => (v ? v : undefined));

const base = {
  pacienteId: z.string().cuid(),
  atencionId: opcional(z.string().cuid()),
  medicoId: z.string().cuid(),
  sedeId: z.string().cuid(),
};

const medicamentoSchema = z.object({
  medicamento: z.string().trim().min(2).max(200),
  dosis: z.string().trim().min(1).max(80),
  frecuencia: z.string().trim().min(1).max(80),
  duracion: z.string().trim().min(1).max(80),
});

const createFormulaSchema = z.object({
  ...base,
  items: z.array(medicamentoSchema).min(1, 'Agrega al menos un medicamento'),
});

const ordenItemSchema = z.object({
  cupsId: z.string().cuid(),
  prioridad: z.enum(PRIORIDADES_ORDEN).default('rutinaria'),
});

const createOrdenSchema = z.object({
  ...base,
  items: z.array(ordenItemSchema).min(1, 'Agrega al menos un examen o imagen'),
});

const createRemisionSchema = z.object({
  ...base,
  especialidadDestino: z.string().trim().min(2).max(200),
  ipsDestino: z.string().trim().min(2).max(200),
  justificacion: z.string().trim().min(5).max(1000),
});

const createIncapacidadSchema = z
  .object({
    ...base,
    cie10Id: z.string().cuid(),
    numeroDias: z.coerce.number().int().min(1).max(180),
    fechaInicio: z.coerce.date(),
    fechaFin: z.coerce.date(),
  })
  .refine((d) => d.fechaFin >= d.fechaInicio, { message: 'La fecha fin debe ser posterior o igual a la de inicio', path: ['fechaFin'] });

const createConsentimientoSchema = z.object({
  ...base,
  procedimiento: z.string().trim().min(3).max(300),
  firmante: z.string().trim().min(2).max(120).optional().default('Paciente'),
});

const anularSchema = z.object({
  motivo: z.string().trim().min(5, 'Indica el motivo de la anulación').max(500),
});

module.exports = {
  PRIORIDADES_ORDEN,
  createFormulaSchema,
  createOrdenSchema,
  createRemisionSchema,
  createIncapacidadSchema,
  createConsentimientoSchema,
  anularSchema,
};
