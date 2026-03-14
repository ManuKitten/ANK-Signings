const mongoose = require('mongoose');

const KeySchema = new mongoose.Schema({
    userId: { type: String, unique: true },
    publicKey: Array,
    privateKey: String
}, { strict: false }); // 'strict: false' allows you to save your existing JSON structure easily

module.exports = mongoose.model('Key', KeySchema);