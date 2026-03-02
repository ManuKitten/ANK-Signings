const mongoose = require('mongoose');

const TournamentSchema = new mongoose.Schema({
    tournamentId: { type: String, unique: true },
    name: String,
    year: Number,
    type: String,
    teams: [String],
    table: Array,
    matchdays: Array,
    stats: {
        goals: { type: Map, of: Number },
        yellowCards: { type: Map, of: Number },
        redCards: { type: Map, of: Number }
    },
    obsolete: Boolean
}, { strict: false }); // 'strict: false' allows you to save your existing JSON structure easily

module.exports = mongoose.model('Tournament', TournamentSchema);