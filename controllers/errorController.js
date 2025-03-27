const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const message = `Duplicate field value: "${err.keyValue.name}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors)
    .map((el) => el.message)
    .join('. ');
  const message = `Invalid input data: ${errors}`;
  return new AppError(message, 400);
};

const handleJWEError = () =>
  new AppError('Invalid token. Please log in again!!', 401);

const handleTokenExpiredError = () =>
  new AppError('Your token has expired! Please log in again!!', 401);

///////////////// send dev and prod
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Lỗi operational, gửi thông báo đến clients
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    /// lỗi programming or lỗi unknown khác: không leak error detail
    console.error(err);

    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!!',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    // console.log(err);
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = JSON.parse(JSON.stringify(err));

    if (error.name === 'CastError') error = handleCastErrorDB(error); //getTour wrong id
    if (error.code === 11000) error = handleDuplicateFieldsDB(error); // postTour trùng fields
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error); // lỗi xác thực khi nhập vào DB
    if (error.name === 'JsonWebTokenError') error = handleJWEError();
    if (error.name === 'TokenExpiredError') error = handleTokenExpiredError();
    sendErrorProd(error, res);
  }
};
