const mongoose = require('mongoose');

const CorrespondenceSchema = new mongoose.Schema({
    userId: { type: String },
    mailId: { type: String },
    about: String,
    from: String,
    sender: String,
    content: String,
    clicked: Boolean,
    newRsa: Boolean
}, { strict: false }); // 'strict: false' allows you to save your existing JSON structure easily

module.exports = mongoose.model('Correspondence', CorrespondenceSchema);