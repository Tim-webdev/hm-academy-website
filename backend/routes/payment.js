const express = require('express');
const axios = require('axios');
const router = express.Router();
const Payment = require('../models/Payment'); // Ensure you have this model

// ✅ Initialize Payment with Paystack
router.post('/initialize', async (req, res) => {
  try {
    const { email, programName, amount } = req.body;

    // Create a unique reference
    const reference = `HM-${Date.now()}`;

    // Call Paystack initialize API
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: amount * 100, // Paystack expects amount in kobo
        reference,
        metadata: { programName }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, // secret key from .env
          'Content-Type': 'application/json'
        }
      }
    );

    // Save pending payment in DB
    await Payment.create({ email, programName, amount, reference, status: 'pending' });

    // Return Paystack authorization URL & reference
    res.json({
      success: true,
      authorization_url: response.data.data.authorization_url,
      reference
    });
  } catch (err) {
    console.error('❌ Init payment error:', err.response?.data || err.message);
    res.status(500).json({ success: false, message: 'Server error initializing payment' });
  }
});

// ✅ Verify Payment
router.get('/verify/:reference', async (req, res) => {
  try {
    const { reference } = req.params;

    // Call Paystack verify API
    const verifyRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    const paymentData = verifyRes.data.data;

    if (paymentData.status === 'success') {
      // Update payment record in DB
      await Payment.findOneAndUpdate({ reference }, { status: 'success' });

      return res.json({ success: true, data: paymentData });
    }

    res.json({ success: false, message: 'Payment not successful' });
  } catch (err) {
    console.error('❌ Verify error:', err.response?.data || err.message);
    res.status(500).json({ success: false, message: 'Server error verifying payment' });
  }
});

module.exports = router;
