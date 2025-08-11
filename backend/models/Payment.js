const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  email: String,
  programId: String,
  programName: String,
  amount: Number,
  reference: { type: String, unique: true },
  status: String,
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);