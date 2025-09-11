const mongoose = require('mongoose');

const teamAssignSchema = new mongoose.Schema({
    team: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
    issue: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Issue' }],
}, { timestamps: true });

module.exports = mongoose.model('TeamAssign', teamAssignSchema);
