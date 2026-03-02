const mongoose = require('mongoose');

const DebtSchema = new mongoose.Schema({
    teamId: { type: String, unique: true },
    amount: { type: Number }
}, { strict: false }); // 'strict: false' allows you to save your existing JSON structure easily

module.exports = mongoose.model('Debt', DebtSchema);