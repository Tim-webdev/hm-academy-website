const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const OTP = require('../models/OTP');
const sendEmail = require('../utils/sendEmail');

const router = express.Router();

// ✅ Health check route
router.get('/', (req, res) => {
  res.send('🔐 Auth route working!');
});

/* ============================================================
   1. SEND OTP
============================================================ */
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Remove old OTP for same email
    await OTP.findOneAndDelete({ email });

    const otpEntry = new OTP({
      email,
      code: otpCode,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    });
    await otpEntry.save();

    // 🔔 Make sure sendEmail doesn't crash deployment
    try {
      await sendEmail(email, 'Your OTP Code', `Use this code: ${otpCode}`);
      console.log(`✅ OTP sent to ${email}: ${otpCode}`);
    } catch (emailErr) {
      console.error('⚠️ Email sending failed:', emailErr.message);
    }

    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (err) {
    console.error('❌ OTP send error:', err.message);
    res.status(500).json({ success: false, message: 'Error sending OTP' });
  }
});

/* ============================================================
   2. VERIFY OTP
============================================================ */
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Email and code are required' });
    }

    const otpEntry = await OTP.findOne({ email, code });

    if (!otpEntry || otpEntry.expiresAt < Date.now()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    res.json({ success: true, message: 'OTP verified' });
  } catch (err) {
    console.error('❌ Verify OTP error:', err.message);
    res.status(500).json({ success: false, message: 'Error verifying OTP' });
  }
});

/* ============================================================
   3. RESET PASSWORD
============================================================ */
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: 'All fields required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        redirect: true
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Clear used OTP
    await OTP.deleteMany({ email });

    res.json({
      success: true,
      message: 'Password reset successful',
      role: user.role,
    });
  } catch (err) {
    console.error('❌ Reset password error:', err.message);
    res.status(500).json({ success: false, message: 'Error resetting password' });
  }
});

/* ============================================================
   4. REGISTER NEW STUDENT
============================================================ */
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'All fields required' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashed,
      role: 'student',
      createdAt: new Date()
    });

    await user.save();

    res.json({ success: true, message: 'Account created successfully!' });
  } catch (err) {
    console.error('❌ Registration error:', err.message);
    res.status(500).json({ success: false, message: 'Error creating account' });
  }
});

/* ============================================================
   5. LOGIN
============================================================ */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.json({
      success: true,
      message: 'Login successful',
      role: user.role
    });
  } catch (err) {
    console.error('❌ Login error:', err.message);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

module.exports = router;