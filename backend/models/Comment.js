const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  issue: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue', required: true },
  status: { type: String, enum: ['Approved', 'Declined', 'Pending'], default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);
