const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  description: { type: String, required: true },
  photoUrl: { type: String },
  audioUrl: { type: String },
  address: { type: String, required: true },
  priority: { type: String, enum: ['Critical', 'Moderate', 'Low'], default: 'Moderate' },
  status: { type: String, enum: ['Pending', 'In Progress', 'Resolved'], default: 'Pending' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
}, { timestamps: true });

module.exports = mongoose.model('Issue', issueSchema);
