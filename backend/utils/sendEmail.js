const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

module.exports = async function sendEmail(to, subject, html) {
  await transporter.sendMail({
    from: `"Hands and Minds Academy" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};