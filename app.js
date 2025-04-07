const express = require('express');
const tourRouter = require('./routes/tourRoutes');
const morgan = require('morgan');

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));
app.use('/app/v1/tours', tourRouter);

module.exports = app;
