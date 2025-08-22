const express = require('express');
const router = express.Router();
const BioData = require('../models/BioData');

// ✅ Save or Update Student Biodata
router.post('/biodata', async (req, res) => {
  try {
    const { email, fullName, phone, gender, dob, address } = req.body;

    if (!email || !fullName || !phone || !gender || !dob || !address) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    let record = await BioData.findOne({ email });
    if (record) {
      Object.assign(record, { fullName, phone, gender, dob, address });
      await record.save();

      return res.json({ success: true, message: 'Biodata updated successfully', data: record });
    }

    const newData = await BioData.create({ email, fullName, phone, gender, dob, address });
    res.json({ success: true, message: 'Biodata saved successfully', data: newData });

  } catch (err) {
    console.error('❌ Error saving biodata:', err);
    res.status(500).json({ success: false, message: 'Server error saving biodata' });
  }
});

// ✅ Fetch Student Biodata by Email
router.post('/biodata', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const record = await BioData.findOne({ email });

    if (!record) {
      return res.json({ success: false, message: 'No biodata found for this email' });
    }

    res.json({ success: true, data: record });

  } catch (err) {
    console.error('❌ Error fetching biodata:', err);
    res.status(500).json({ success: false, message: 'Server error fetching biodata' });
  }
});

module.exports = router;