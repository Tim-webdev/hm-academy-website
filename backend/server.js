require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// 📌 Middleware
app.use(cors());
app.use(express.json());

// 📌 Routes
const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payment');
const userRoutes = require('./routes/user');
const studentRoutes = require('./routes/student'); // 👈 New Student biodata route

// 📌 Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 📌 Register API routes
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/user', userRoutes);
app.use('/api/students', studentRoutes); // 👈 Register student biodata routes

// 📌 MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// 📌 Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});