const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  prompt: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const GPT = mongoose.model('gpt', schema);

module.exports = GPT;