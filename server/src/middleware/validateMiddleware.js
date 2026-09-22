export function validateBody(schema) {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req.body);
      req.body = parsed;
      next();
    } catch (err) {
      if (err.errors) {
        const fieldErrors = {};
        err.errors.forEach((e) => {
          const field = e.path.join('.');
          fieldErrors[field] = e.message;
        });
        return res.status(400).json({
          success: false,
          message: err.errors[0]?.message || 'Validation failed',
          errors: fieldErrors,
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Invalid input payload',
      });
    }
  };
}
