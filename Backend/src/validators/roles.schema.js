const { z } = require('zod');

const MODULOS = ['pacientes', 'historia_clinica', 'agenda', 'formulas_ordenes', 'reportes', 'administracion'];

const permisoRolSchema = z.object({
  modulo: z.enum(MODULOS),
  ver: z.boolean().default(false),
  crear: z.boolean().default(false),
  editar: z.boolean().default(false),
  eliminar: z.boolean().default(false),
  imprimir: z.boolean().default(false),
  exportar: z.boolean().default(false),
});

const setPermisosRolSchema = z.object({
  permisos: z.array(permisoRolSchema).min(1).max(MODULOS.length),
});

module.exports = { setPermisosRolSchema };
