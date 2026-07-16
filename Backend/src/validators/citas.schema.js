const { z } = require('zod');

const ESTADOS_CITA = ['agendada', 'confirmada', 'en_atencion', 'atendida', 'cancelada', 'no_asistio'];

const rangoValido = (data) => data.fin > data.inicio;

const baseFields = {
  pacienteId: z.string().cuid(),
  medicoId: z.string().cuid(),
  consultorioId: z.string().cuid(),
  sedeId: z.string().cuid(),
  inicio: z.coerce.date(),
  fin: z.coerce.date(),
  motivo: z.string().trim().max(200).optional().or(z.literal('')).transform((v) => (v ? v : undefined)),
  notas: z.string().trim().max(500).optional().or(z.literal('')).transform((v) => (v ? v : undefined)),
};

const createCitaSchema = z
  .object(baseFields)
  .refine(rangoValido, { message: 'La hora de fin debe ser posterior a la de inicio', path: ['fin'] });

const reprogramarCitaSchema = z
  .object({
    inicio: z.coerce.date(),
    fin: z.coerce.date(),
    motivoReprogramacion: z.string().trim().min(3, 'Indica el motivo de la reprogramación').max(255),
  })
  .refine(rangoValido, { message: 'La hora de fin debe ser posterior a la de inicio', path: ['fin'] });

const estadoCitaSchema = z
  .object({
    estado: z.enum(ESTADOS_CITA),
    motivoCancelacion: z.string().trim().max(255).optional().or(z.literal('')).transform((v) => (v ? v : undefined)),
  })
  .refine((data) => data.estado !== 'cancelada' || !!data.motivoCancelacion, {
    message: 'La cancelación requiere un motivo',
    path: ['motivoCancelacion'],
  });

module.exports = {
  ESTADOS_CITA,
  createCitaSchema,
  reprogramarCitaSchema,
  estadoCitaSchema,
};
