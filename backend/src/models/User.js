const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  preferences: {
    genres: {
      type: [String],
      default: []
    },
    favoriteActors: {
      type: [String],
      default: []
    }
  },
  watchedMovies: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Movie",
    default: []
  },
  watchlist: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Movie",
    default: []
  },
  streak: {
    count: { type: Number, default: 0 },
    lastLogin: { type: Date, default: null }
  },
  points: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);