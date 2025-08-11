const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

const BioData = require('../models/BioData');
const Payment = require('../models/Payment');

// 📂 Multer config for avatar uploads
const storage = multer.diskStorage({
  destination: './uploads/avatars',
  filename: (req, file, cb) =>
    cb(null, `${req.body.email}_${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage, limits: { fileSize: 2000000 } });

// 📌 1. Save Bio-data (from student-dashboard form)
router.post('/save-biodata', async (req, res) => {
  try {
    const { email, fullName, phone, gender, dob, address } = req.body;

    let record = await BioData.findOne({ email });
    if (record) {
      record.fullName = fullName;
      record.phone = phone;
      record.gender = gender;
      record.dob = dob;
      record.address = address;
      await record.save();
    } else {
      record = await BioData.create({ email, fullName, phone, gender, dob, address });
    }

    res.json({ success: true, message: 'Bio-data saved successfully', data: record });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error saving biodata' });
  }
});

// 📌 2. Get Bio-data (for student-profile.js)
router.post('/biodata', async (req, res) => {
  try {
    const { email } = req.body;
    const record = await BioData.findOne({ email });
    if (!record) return res.json({ success: false, message: 'No biodata found' });
    res.json({ success: true, data: record });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error fetching biodata' });
  }
});

// 📌 3. Get Payment Status
router.get('/payments/:email', async (req, res) => {
  try {
    const payments = await Payment.find({ email: req.params.email }).sort('-createdAt');
    res.json({ success: true, payments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error fetching payments' });
  }
});

// 📌 4. Upload Avatar + Update profile
router.post('/update-profile', upload.single('avatar'), async (req, res) => {
  const { email, fullName, phone, gender, dob, address } = req.body;
  const update = { email, fullName, phone, gender, dob, address };
  if (req.file) update.avatarUrl = `/uploads/avatars/${req.file.filename}`;

  try {
    const record = await BioData.findOneAndUpdate({ email }, update, { upsert: true, new: true });
    res.json({ success: true, data: record });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error updating profile' });
  }
});

// 📌 5. Admin: List all students with payment
router.get('/allstudents', async (req, res) => {
  try {
    const students = await BioData.find({}, 'email fullName avatarUrl').lean();
    const results = await Promise.all(students.map(async (stu) => {
      const payments = await Payment.find({ email: stu.email }).sort('-createdAt');
      const paid = payments.some(p => p.status === 'success');
      return { ...stu, paid, payments };
    }));
    res.json({ success: true, students: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error fetching students' });
  }
});

module.exports = router;