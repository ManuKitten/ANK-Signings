const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
    matchId: { type: String, unique: true },
    tournament: String,
    homeTeam: String,
    awayTeam: String,
    start: {
        year: Number,
        month: Number,
        day: Number,
        hour: Number,
        minute: Number,
    },
    score: [Number],
    min: Number,
    lineups: Array,
    events: Array,
    end: Boolean
}, { strict: false }); // 'strict: false' allows you to save your existing JSON structure easily

module.exports = mongoose.model('Match', MatchSchema);