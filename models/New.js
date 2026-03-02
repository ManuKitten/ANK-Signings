const mongoose = require('mongoose');

const NewSchema = new mongoose.Schema({
    newId: { type: String, unique: true },
    name: String,
    desc: String,
    concern: {
        teams: [String],
        tournaments: [String]
    }
}, { strict: false }); // 'strict: false' allows you to save your existing JSON structure easily

module.exports = mongoose.model('New', NewSchema);