const express = require('express');
const path = require('path');
const config = require('./config');
const logger = require('./middleware/logger');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const productsRouter = require('./routes/products');

const app = express();

app.use(logger);
app.use(express.json());

// Раздача загруженных изображений
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/products', productsRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server is running on http://localhost:${config.port}`);
});
