const Joi = require('joi');
const { categories } = require('../config');

const fields = {
  name: Joi.string().trim().min(2).max(100),
  price: Joi.number().greater(0),
  category: Joi.string().valid(...categories),
  stock: Joi.number().integer().min(0),
  description: Joi.string().trim().max(500).allow(''),
};

// POST и PUT: обязательные поля name, price, category
const productSchema = Joi.object({
  name: fields.name.required(),
  price: fields.price.required(),
  category: fields.category.required(),
  stock: fields.stock.default(0),
  description: fields.description,
});

// PATCH: любые поля, но минимум одно
const patchSchema = Joi.object({
  name: fields.name,
  price: fields.price,
  category: fields.category,
  stock: fields.stock,
  description: fields.description,
}).min(1);

// Query-параметры GET /api/products
const querySchema = Joi.object({
  category: fields.category,
  minPrice: Joi.number().min(0),
  maxPrice: Joi.number().min(0),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
}).custom((value, helpers) => {
  if (
    value.minPrice !== undefined &&
    value.maxPrice !== undefined &&
    value.minPrice > value.maxPrice
  ) {
    return helpers.message('"minPrice" must be less than or equal to "maxPrice"');
  }
  return value;
});

// Фабрика middleware: validate(schema, 'body' | 'query')
function validate(schema, source = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: false,
    });

    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map((d) => ({
          field: d.path.join('.') || source,
          message: d.message,
        })),
      });
    }

    // req.query в Express 4 можно перезаписывать через Object.assign
    if (source === 'query') {
      req.validatedQuery = value;
    } else {
      req[source] = value;
    }
    next();
  };
}

module.exports = {
  validate,
  validateProduct: validate(productSchema),
  validatePatch: validate(patchSchema),
  validateQuery: validate(querySchema, 'query'),
};
