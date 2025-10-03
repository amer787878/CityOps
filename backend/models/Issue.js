const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const issueSchema = new mongoose.Schema({
  description: { type: String, required: true },
  photoUrl: { type: String },
  audioUrl: { type: String },
  address: { type: String, required: true },
  priority: { type: String, enum: ['Critical', 'Moderate', 'Low'], default: 'Moderate' },
  category: { type: String, enum: ['Road Maintenance', 'Waste Disposal', 'Streetlight Repair'], default: '' },
  status: { type: String, enum: ['Pending', 'In Progress', 'Resolved'], default: 'Pending' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

// Apply the auto-increment plugin to the `issueNumber` field
issueSchema.plugin(AutoIncrement, { inc_field: 'issueNumber', start_seq: 1000 });

module.exports = mongoose.model('Issue', issueSchema);
