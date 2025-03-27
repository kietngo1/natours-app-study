const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

process.on('uncaughtException', (err) => {
  console.log('Unhandle Exception! Shutting down ...');
  console.log(err.name, err.message);
  process.exit(1);
});

const app = require('./app');

/////// Connect database
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((con) => {
    console.log('DB connect successful!');
  });

// const testTour = new Tour({
//   name: 'The Park Camper',
//   price: 997,
// });
// testTour
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
//   .catch((err) => {
//     console.log(err);
//   });

//////// Connect server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// Xử lý tất cả các lỗi chưa được xử lý trước đó trong async code
process.on('unhandledRejection', (err) => {
  console.log('Unhandle Rejection! Shutting down ...');
  console.log(err.name, err.message);

  server.close(() => {
    process.exit(1);
  });
});
