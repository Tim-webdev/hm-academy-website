require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// 📌 Middleware
app.use(cors());
app.use(express.json());

// 📌 Routes
const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payment');
const userRoutes = require('./routes/user');
const studentRoutes = require('./routes/student');

// 📂 Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads/avatars');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 📌 Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 📌 Register API routes
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/user', userRoutes);
app.use('/api/students', studentRoutes);

// 🚑 Fallback route in case paymentRoutes is missing /initialize
app.post('/api/payments/initialize', (req, res) => {
  return res.json({ status: "success", message: "Payment initialized (test route)" });
});

// ✅ Serve frontend if it exists
const frontendPath = path.join(__dirname, '../frontend');
if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));

  // ✅ Catch-all route for SPA
  app.get('/*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// 📌 MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1); // stop app if DB fails
  });

// 📌 Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
