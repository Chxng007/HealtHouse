function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return res.status(400).json({
        error: 'Datos inválidos',
        detalles: result.error.flatten().fieldErrors,
      });
    }
    req[source] = result.data;
    next();
  };
}

module.exports = { validate };
