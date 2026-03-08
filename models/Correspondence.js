const mongoose = require('mongoose');

const CorrespondenceSchema = new mongoose.Schema({
    userId: { type: String },
    mailId: {
        about: String,
        from: String,
        sender: String,
        content: String,
        clicked: Boolean
    }
}, { strict: false }); // 'strict: false' allows you to save your existing JSON structure easily

module.exports = mongoose.model('Correspondence', CorrespondenceSchema);