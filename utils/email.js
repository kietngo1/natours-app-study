const nodemailer = require('nodemailer');
////////////////////////////////////

const sendEmail = async (options) => {
  // 1/ Tạo transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2/ Xác định các email option
  const mailOptions = {
    from: 'PhuKietNgo <kietngo@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3/ Gửi email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
