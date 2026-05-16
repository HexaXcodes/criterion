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
  type: {
    type: String,
    default: 'movie',
    enum: ['movie', 'tv'],
  },
  language: {
    type: String,
    default: 'en'
  },
  tmdbId: {
    type: Number,
    sparse: true,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Movie", movieSchema);