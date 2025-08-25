const express = require('express');
const axios = require('axios');
const router = express.Router();
const Payment = require('../models/Payment');
const nodemailer = require('nodemailer');

// 📧 Email transporter (using Gmail or your SMTP)
const transporter = nodemailer.createTransport({
  service: "gmail", // You can change to outlook, yahoo, or custom SMTP
  auth: {
    user: process.env.EMAIL_USER, // e.g. "hmacademy@gmail.com"
    pass: process.env.EMAIL_PASS  // app password, not your raw password
  }
});

// ✅ Initialize Payment with Paystack
router.post('/initialize', async (req, res) => {
  try {
    const { email, programName, amount } = req.body;

    if (!email || !programName || !amount) {
      return res.status(400).json({ success: false, message: 'Email, programName, and amount are required' });
    }

    const reference = `HM-${Date.now()}`;

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: amount * 100,
        reference,
        metadata: { programName }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    await Payment.create({ email, programName, amount, reference, status: 'pending', createdAt: new Date() });

    return res.json({
      success: true,
      authorization_url: response.data.data.authorization_url,
      reference
    });
  } catch (err) {
    console.error('❌ Init payment error:', err.response?.data || err.message);
    return res.status(500).json({ success: false, message: 'Error initializing payment. Please try again.' });
  }
});

// ✅ Verify Payment
router.get('/verify/:reference', async (req, res) => {
  try {
    const { reference } = req.params;

    if (!reference) {
      return res.status(400).json({ success: false, message: 'Reference is required' });
    }

    const verifyRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
      }
    );

    const paymentData = verifyRes.data.data;

    if (paymentData.status === 'success') {
      const updatedPayment = await Payment.findOneAndUpdate(
        { reference },
        { status: 'success', paidAt: new Date() },
        { new: true }
      );

      // 📧 Send Email Receipt
      try {
        await transporter.sendMail({
          from: `"H&M Academy" <${process.env.EMAIL_USER}>`,
          to: updatedPayment.email,
          subject: "Payment Confirmation - H&M Academy",
          html: `
            <h2>Payment Successful ✅</h2>
            <p>Dear Student,</p>
            <p>We have received your payment for the <strong>${updatedPayment.programName}</strong> program.</p>
            <p><b>Amount:</b> ₦${updatedPayment.amount.toLocaleString()}<br/>
            <b>Reference:</b> ${updatedPayment.reference}<br/>
            <b>Date:</b> ${new Date(updatedPayment.paidAt).toLocaleString()}</p>
            <p>Your account is now active. Welcome to H&M Academy! 🎉</p>
            <hr/>
            <p>H&M Academy Support</p>
          `
        });
        console.log(`📧 Email sent to ${updatedPayment.email}`);
      } catch (emailErr) {
        console.error("❌ Email sending error:", emailErr.message);
      }

      return res.json({ success: true, data: paymentData });
    }

    return res.json({ success: false, message: 'Payment not successful' });
  } catch (err) {
    console.error('❌ Verify error:', err.response?.data || err.message);
    return res.status(500).json({ success: false, message: 'Error verifying payment. Please try again.' });
  }
});

module.exports = router;
