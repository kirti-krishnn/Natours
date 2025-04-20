const express = require('express');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRouter');
const morgan = require('morgan');
const globalErrorHandler = require('./controller/errorController');
const AppError = require('./utils/appError');

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));
app.use('/app/v1/tours', tourRouter);
app.use('/app/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(new AppError('the requested route does not exist.', 404));
});

app.use(globalErrorHandler);

module.exports = app;
