// test-email.js
require('dotenv').config();
const sendEmail = require('./utils/sendEmail');

(async () => {
  try {
    await sendEmail(
      'timothyowuzoh@gmail.com', // replace this with your real email
      '🧪 Test Email from HMAcademy',
      '<h3>If you got this email, OTP system works ✅</h3>'
    );
    console.log('✅ Email sent successfully!');
  } catch (err) {
    console.error('❌ Email failed to send:', err.message);
  }
})();