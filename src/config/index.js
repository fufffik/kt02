require('dotenv').config();
const path = require('path');

module.exports = {
  port: process.env.PORT || 3000,
  categories: ['electronics', 'clothing', 'food', 'other'],
  upload: {
    dir: path.join(__dirname, '..', '..', 'uploads', 'products'),
    publicPath: '/uploads/products',
    maxSize: 2 * 1024 * 1024, // 2 МБ
    allowedMimeTypes: ['image/jpeg', 'image/png'],
  },
};
