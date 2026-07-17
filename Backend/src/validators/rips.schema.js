const { z } = require('zod');

const opcional = (schema) => schema.optional().or(z.literal('')).transform((v) => (v ? v : undefined));

const generarRipsSchema = z
  .object({
    desde: z.coerce.date(),
    hasta: z.coerce.date(),
    sedeId: opcional(z.string().cuid()),
  })
  .refine((d) => d.hasta >= d.desde, { message: 'La fecha hasta debe ser posterior o igual a la de inicio', path: ['hasta'] });

module.exports = { generarRipsSchema };
