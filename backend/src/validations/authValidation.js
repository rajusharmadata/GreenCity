/**
 * Lightweight validation helper using simple schemas.
 * In a real production app, we would use Joi or Express-Validator,
 * but for this refactor we'll implement a clean, scalable custom logic.
 */

export const validate = (schema) => (req, res, next) => {
  const { body } = req;
  const errors = [];

  Object.keys(schema).forEach((field) => {
    const rules = schema[field];
    const value = body[field];

    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
    }

    if (value && rules.min && value.length < rules.min) {
      errors.push(`${field} must be at least ${rules.min} characters`);
    }

    if (value && rules.pattern && !rules.pattern.test(String(value))) {
      errors.push(`${field} is invalid`);
    }
  });

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

export const authSchemas = {
  register: {
    name: { required: true },
    email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    password: { required: true, min: 6 }
  },
  login: {
    email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    password: { required: true }
  }
};
