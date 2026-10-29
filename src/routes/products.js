const express = require('express');
const fs = require('fs');
const path = require('path');
const { upload: uploadCfg } = require('../config');
const { validateProduct, validatePatch, validateQuery } = require('../middleware/validate');
const upload = require('../middleware/upload');

const router = express.Router();

// Хранилище в памяти
let products = [];
let nextId = 1;

const findIndexById = (id) => products.findIndex((p) => p.id === id);

function removeImageFile(imageUrl) {
  if (!imageUrl) return;
  const file = path.join(uploadCfg.dir, path.basename(imageUrl));
  fs.unlink(file, () => {});
}

// Проверка :id и поиск товара (выполняется до загрузки файла в Multer)
router.param('id', (req, res, next, raw) => {
  const id = Number(raw);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({
      error: 'Validation failed',
      details: [{ field: 'id', message: '"id" must be a positive integer' }],
    });
  }
  const index = findIndexById(id);
  if (index === -1) {
    return res.status(404).json({ error: `Product with id ${id} not found` });
  }
  req.productIndex = index;
  next();
});

// GET /api/products — список с фильтрацией и пагинацией
router.get('/', validateQuery, (req, res) => {
  const { category, minPrice, maxPrice, page, limit } = req.validatedQuery;

  let result = products;
  if (category) result = result.filter((p) => p.category === category);
  if (minPrice !== undefined) result = result.filter((p) => p.price >= minPrice);
  if (maxPrice !== undefined) result = result.filter((p) => p.price <= maxPrice);

  const total = result.length;
  const start = (page - 1) * limit;

  res.json({ data: result.slice(start, start + limit), total, page, limit });
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
  res.json(products[req.productIndex]);
});

// POST /api/products
router.post('/', validateProduct, (req, res) => {
  const product = {
    id: nextId++,
    ...req.body,
    imageUrl: null,
    createdAt: new Date().toISOString(),
  };
  products.push(product);
  res.status(201).json(product);
});

// PUT /api/products/:id — полная замена
router.put('/:id', validateProduct, (req, res) => {
  const old = products[req.productIndex];
  const updated = {
    id: old.id,
    ...req.body,
    imageUrl: old.imageUrl,
    createdAt: old.createdAt,
  };
  products[req.productIndex] = updated;
  res.json(updated);
});

// PATCH /api/products/:id — частичное обновление
router.patch('/:id', validatePatch, (req, res) => {
  const updated = { ...products[req.productIndex], ...req.body };
  products[req.productIndex] = updated;
  res.json(updated);
});

// DELETE /api/products/:id
router.delete('/:id', (req, res) => {
  const [removed] = products.splice(req.productIndex, 1);
  removeImageFile(removed.imageUrl);
  res.status(204).send();
});

// POST /api/products/:id/image — загрузка изображения (поле формы "image")
router.post('/:id/image', upload, (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      error: 'Validation failed',
      details: [{ field: 'image', message: 'Image file is required (field name "image")' }],
    });
  }

  const product = products[req.productIndex];
  removeImageFile(product.imageUrl); // удаляем старое изображение
  product.imageUrl = `${uploadCfg.publicPath}/${req.file.filename}`;

  res.json(product);
});

module.exports = router;
