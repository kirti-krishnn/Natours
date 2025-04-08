const express = require('express');
const tourRouter = require('./routes/tourRoutes');
const morgan = require('morgan');
const globalErrorHandler = require('./controller/errorController');

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));
app.use('/app/v1/tours', tourRouter);

app.all('*', (req, res, next) => {
  next(new AppError('the requested route does not exist.', 404));
});

app.use(globalErrorHandler);

module.exports = app;
