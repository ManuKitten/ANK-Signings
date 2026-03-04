const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
    teamId: { type: String, unique: true },
    name: String,
    players: [String],
    wealth: String, // Since you use Vigenere encryption on this string
    logoURL: String
}, { strict: false }); // 'strict: false' allows you to save your existing JSON structure easily

module.exports = mongoose.model('Team', TeamSchema);