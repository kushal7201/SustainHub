const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
    longitude: {
        type: Number,
        required: true
    },
    latitude: {
        type: Number,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },    category: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },    status: {
        type: String,
        enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'IN_PROGRESS', 'RESOLVED'],
        default: 'PENDING'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Issue', issueSchema);
