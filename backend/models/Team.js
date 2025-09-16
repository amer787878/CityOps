const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const teamSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        image: { type: String },
        members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        category: { type: String, enum: ['Road Repair', 'Streetlight Maintenance'], default: 'Road Repair' },
        availability: { type: String, enum: ['Available', 'Busy'], default: 'Available' },
        teamNumber: { type: Number, unique: true },
    },
    { timestamps: true }
);

// Apply the auto-increment plugin to the `teamNumber` field
teamSchema.plugin(AutoIncrement, { inc_field: 'teamNumber', start_seq: 1000 });

module.exports = mongoose.model('Team', teamSchema);
