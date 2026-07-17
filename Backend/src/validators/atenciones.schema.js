const { z } = require('zod');

const TIPOS_DIAGNOSTICO = ['principal', 'secundario', 'complicacion'];
const CONDICIONES_DIAGNOSTICO = ['confirmado', 'impresion_diagnostica'];

const opcional = (schema) => schema.optional().or(z.literal('')).transform((v) => (v ? v : undefined));

const signosVitalesSchema = z
  .object({
    taSistolica: z.coerce.number().int().min(40).max(300).nullish(),
    taDiastolica: z.coerce.number().int().min(20).max(200).nullish(),
    fc: z.coerce.number().int().min(20).max(250).nullish(),
    fr: z.coerce.number().int().min(5).max(80).nullish(),
    temperatura: z.coerce.number().min(25).max(45).nullish(),
    peso: z.coerce.number().min(0.5).max(400).nullish(),
    talla: z.coerce.number().min(20).max(250).nullish(),
    spo2: z.coerce.number().int().min(0).max(100).nullish(),
  })
  .optional();

const diagnosticoSchema = z.object({
  cie10Id: z.string().cuid(),
  tipo: z.enum(TIPOS_DIAGNOSTICO),
  condicion: z.enum(CONDICIONES_DIAGNOSTICO),
});

function sinCie10Repetido(data) {
  const ids = data.diagnosticos.map((d) => d.cie10Id);
  return new Set(ids).size === ids.length;
}

const baseFields = {
  motivoConsulta: z.string().trim().min(3, 'Describe el motivo de consulta').max(1000),
  enfermedadActual: opcional(z.string().trim().max(2000)),
  antecedentesPersonales: opcional(z.string().trim().max(2000)),
  antecedentesFamiliares: opcional(z.string().trim().max(2000)),
  antecedentesFarmacologicos: opcional(z.string().trim().max(2000)),
  examenFisico: opcional(z.string().trim().max(2000)),
  planManejo: opcional(z.string().trim().max(2000)),
  signosVitales: signosVitalesSchema,
  diagnosticos: z.array(diagnosticoSchema).max(20).optional().default([]),
};

const createAtencionSchema = z
  .object({
    pacienteId: z.string().cuid(),
    admisionId: opcional(z.string().cuid()),
    medicoId: z.string().cuid(),
    sedeId: z.string().cuid(),
    ...baseFields,
  })
  .refine(sinCie10Repetido, { message: 'No se puede repetir el mismo código CIE-10', path: ['diagnosticos'] });

const updateAtencionSchema = z
  .object(baseFields)
  .refine(sinCie10Repetido, { message: 'No se puede repetir el mismo código CIE-10', path: ['diagnosticos'] });

const anularAtencionSchema = z.object({
  motivo: z.string().trim().min(5, 'Indica el motivo de la anulación').max(500),
});

module.exports = {
  TIPOS_DIAGNOSTICO,
  CONDICIONES_DIAGNOSTICO,
  createAtencionSchema,
  updateAtencionSchema,
  anularAtencionSchema,
};
