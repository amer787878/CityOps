const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const issueSchema = new mongoose.Schema({
  description: { type: String, required: true },
  transcription: { type: String },
  photoUrl: { type: String },
  audioUrl: { type: String },
  address: { type: String, required: true },
  priority: { type: String, enum: ['Critical', 'Moderate', 'Low'], default: 'Moderate' },
  category: { type: String, enum: ['Road Maintenance', 'Waste Disposal', 'Streetlight Maintenance'], default: '' },
  status: { type: String, enum: ['Pending', 'In Progress', 'Resolved', 'Closed'], default: 'Pending' },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  public_view: { type: String, enum: ['Approved', 'Rejected', 'Review'], default: 'Review' },
  reason: { type: String },
}, { timestamps: true });

// Apply the auto-increment plugin to the `issueNumber` field
issueSchema.plugin(AutoIncrement, { inc_field: 'issueNumber', start_seq: 1000 });

module.exports = mongoose.model('Issue', issueSchema);
