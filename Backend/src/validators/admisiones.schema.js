const { z } = require('zod');

const TIPOS_ATENCION = ['consulta', 'procedimiento', 'urgencia'];
const ESTADOS_ADMISION = ['en_espera', 'en_atencion', 'atendido', 'cancelado'];

const opcional = (schema) => schema.optional().or(z.literal('')).transform((v) => (v ? v : undefined));

const createAdmisionSchema = z.object({
  pacienteId: z.string().cuid(),
  citaId: opcional(z.string().cuid()),
  sedeId: z.string().cuid(),
  medicoId: z.string().cuid(),
  tipoAtencion: z.enum(TIPOS_ATENCION),
  numeroAutorizacion: opcional(z.string().trim().max(40)),
  copago: z.coerce.number().min(0).max(99999999).optional(),
  observaciones: opcional(z.string().trim().max(500)),
});

const estadoAdmisionSchema = z.object({
  estado: z.enum(ESTADOS_ADMISION),
});

module.exports = {
  TIPOS_ATENCION,
  ESTADOS_ADMISION,
  createAdmisionSchema,
  estadoAdmisionSchema,
};
