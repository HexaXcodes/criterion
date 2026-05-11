const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  genre: {
    type: [String],
    required: true
  },
  releaseYear: {
    type: Number
  },
  posterUrl: {
    type: String
  },
  averageRating: {
    type: Number,
    default: 0
  },
  language: {
    type: String,
    default: 'en'
  },
  tmdbId: {
    type: Number,
    unique: true,
    sparse: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Movie", movieSchema);