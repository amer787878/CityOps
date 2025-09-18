const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  issue: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue' },
  read: { type: Boolean, default: false },
  type: { type: String, enum: ['New Comment', 'Critical Issue Reported'], default: 'New Comment' },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
