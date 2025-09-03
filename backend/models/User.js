const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Citizen', 'Authority', 'Admin'], default: 'Citizen' },
  status: { type: String, enum: ['Active', 'Pending', 'Suspended'], default: 'Active' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
