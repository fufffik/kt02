const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { upload: cfg } = require('../config');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, cfg.dir),
  filename: (req, file, cb) => {
    const ext = file.mimetype === 'image/png' ? '.png' : '.jpg';
    const unique = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
    cb(null, `product-${req.params.id}-${unique}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  if (!cfg.allowedMimeTypes.includes(file.mimetype)) {
    const err = new Error('Only JPEG and PNG images are allowed');
    err.status = 400;
    return cb(err);
  }
  cb(null, true);
}

// Поле формы: "image"
module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: cfg.maxSize, files: 1 },
}).single('image');
