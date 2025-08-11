const express = require('express');
const router = express.Router();
const axios = require('axios');
const Payment = require('../models/Payment');
const { nanoid } = require('nanoid');

// Initialize a Transaction
router.post('/initialize', async (req, res) => {
  const { email, programId, programName, amount } = req.body;
  const ref = nanoid(12);
  try {
    const resp = await axios.post('https://api.paystack.co/transaction/initialize', {
      email,
      amount: amount * 100,
      reference: ref,
      metadata: { programId, programName }
    }, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    });
    await Payment.create({ email, programId, programName, amount, reference: ref, status: 'pending' });
    res.json({ authorizationUrl: resp.data.data.authorization_url, reference: ref });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ message: 'Failed to initialize payment' });
  }
});

// Verify Transaction
router.get('/verify/:reference', async (req, res) => {
  const { reference } = req.params;
  try {
    const resp = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
    });
    const status = resp.data.data.status;
    await Payment.findOneAndUpdate({ reference }, { status });
    res.json({ success: status === 'success', data: resp.data.data });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
});

module.exports = router;