const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
    playerId: { type: String, unique: true },
    name: String,
    short: String,
    birthdate: [Number],
    country: String,
    position: String,
    team: String,
    rating: Number,
    marketvalue: Number
}, { strict: false }); // 'strict: false' allows you to save your existing JSON structure easily

module.exports = mongoose.model('Player', PlayerSchema);