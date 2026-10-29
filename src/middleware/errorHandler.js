const multer = require('multer');

// 404 для несуществующих маршрутов
function notFound(req, res) {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
}

// Перехват всех необработанных ошибок
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Ошибки Multer
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'File too large. Maximum size is 2 MB' });
    }
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }

  // Некорректный JSON в теле запроса
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }

  const status = err.status || 500;
  if (status >= 500) console.error(err);

  res.status(status).json({
    error: status >= 500 ? 'Internal server error' : err.message,
  });
}

module.exports = { notFound, errorHandler };
