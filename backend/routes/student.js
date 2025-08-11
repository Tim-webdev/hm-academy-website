// backend/routes/student.js
const express = require('express');
const router = express.Router();
const BioData = require('../models/BioData');

// ✅ Save Biodata
router.post('/save-biodata', async (req, res) => {
  try {
    const { email, fullName, phone, gender, dob, address } = req.body;

    if (!email || !fullName || !phone || !gender || !dob || !address) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // 🛠 Check if biodata already exists
    const existing = await BioData.findOne({ email });
    if (existing) {
      // Update instead of duplicate
      existing.fullName = fullName;
      existing.phone = phone;
      existing.gender = gender;
      existing.dob = dob;
      existing.address = address;
      await existing.save();

      return res.json({ success: true, message: 'Biodata updated successfully', data: existing });
    }

    // Create new biodata entry
    const newData = new BioData({ email, fullName, phone, gender, dob, address });
    await newData.save();

    res.json({ success: true, message: 'Biodata saved successfully', data: newData });
  } catch (err) {
    console.error('❌ Error saving biodata:', err);
    res.status(500).json({ success: false, message: 'Server error saving biodata' });
  }
});

module.exports = router;