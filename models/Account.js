const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
    name: { type: String, unique: true },
    passwordId: { type: String }
}, { strict: false }); // 'strict: false' allows you to save your existing JSON structure easily

module.exports = mongoose.model('Account', AccountSchema);