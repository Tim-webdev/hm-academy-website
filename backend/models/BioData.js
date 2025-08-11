const mongoose = require('mongoose');

const bioSchema = new mongoose.Schema({
  email: String,
  fullName: String,
  phone: String,
  gender: String,
  dob: Date,
  address: String
}, { timestamps: true });

module.exports = mongoose.model('BioData', bioSchema);