const mongoose = require('mongoose');

// Audio Schema
const audioSchema = new mongoose.Schema({
  title: { type: String, required: true },  // Changed 'filename' to 'title'
  description: { type: String },
  category: { type: String, enum: ['Music', 'Podcast', 'Audiobook', 'Other'], default: 'Other' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Renamed 'userId' to 'user'
  fileUrl: { type: String, required: true }, // Stores Google Cloud Storage URL
}, { timestamps: true }); // Auto-adds createdAt & updatedAt

module.exports = mongoose.model('Audio', audioSchema);
