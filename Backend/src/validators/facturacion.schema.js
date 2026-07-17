const { z } = require('zod');

const ESTADOS_FACTURA = ['borrador', 'emitida', 'pagada', 'anulada', 'en_glosa'];
const TIPOS_NOTA = ['credito', 'debito'];
const METODOS_PAGO = ['efectivo', 'tarjeta', 'transferencia'];

const opcional = (schema) => schema.optional().or(z.literal('')).transform((v) => (v ? v : undefined));

const facturaItemSchema = z.object({
  servicioId: z.string().cuid(),
  cantidad: z.coerce.number().int().min(1).max(99).default(1),
});

const createFacturaSchema = z.object({
  pacienteId: z.string().cuid(),
  admisionId: opcional(z.string().cuid()),
  convenioId: z.string().cuid(),
  sedeId: z.string().cuid(),
  items: z.array(facturaItemSchema).min(1, 'Agrega al menos un servicio'),
});

const estadoFacturaSchema = z
  .object({
    estado: z.enum(['anulada', 'en_glosa']),
    motivo: opcional(z.string().trim().max(500)),
  })
  .refine((d) => d.estado !== 'anulada' || !!d.motivo, { message: 'La anulación requiere un motivo', path: ['motivo'] });

const notaFacturaSchema = z.object({
  tipo: z.enum(TIPOS_NOTA),
  valor: z.coerce.number().positive().max(999999999),
  motivo: z.string().trim().min(5, 'Indica el motivo de la nota').max(500),
});

const pagoSchema = z.object({
  metodo: z.enum(METODOS_PAGO),
  valor: z.coerce.number().positive().max(999999999),
});

const cierreCajaSchema = z.object({
  sedeId: z.string().cuid(),
  baseInicial: z.coerce.number().min(0).max(999999999),
  egresos: z.coerce.number().min(0).max(999999999).default(0),
});

module.exports = {
  ESTADOS_FACTURA,
  TIPOS_NOTA,
  METODOS_PAGO,
  createFacturaSchema,
  estadoFacturaSchema,
  notaFacturaSchema,
  pagoSchema,
  cierreCajaSchema,
};
