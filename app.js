const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const globalErrorHandler = require('./controllers/errorController');

const AppError = require('./utils/appError');
///////////////////////////////////
const app = express();

//////////////////// GLOBAL MIDDLEWARWE
// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit request from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// Body parser -> reading data from body into req.body
app.use(
  express.json({
    limit: '10kb',
  })
);

// Data sanitization against NoSQL query: Lọc vào loại bỏ các ký hiệu của mongodb như $,... trong params hoặc request body
app.use(mongoSanitize());

//  xóa đầu vào của user khỏi mã html độc
app.use(xss());

// prevent parameter pollution trong query
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'difficulty',
      'price',
    ], // cho phép dc trùng lặp trong parameter
  })
);

// serving static files
app.use(express.static(`${__dirname}/public`));

// test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  // nếu hàm next nhận đối số, thì express sẽ tự động hiểu đã xảy ra lỗi và sẽ skip hết tất cả middleware khác và nhảy xuống error handling middleware
  next(new AppError(`Can not find ${req.originalUrl} on this server !!`, 404));
});

// middleware có 4 đối số sẽ là error handling middleware
// Tạo global error handling middleware
app.use(globalErrorHandler);

module.exports = app;
