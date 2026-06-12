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
    languages: {
      type: [String],
      default: ['en']
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
  },
  // Password recovery fields
  resetToken: {
    type: String,
    default: null
  },
  resetTokenExpiry: {
    type: Date,
    default: null
  },
  // Email verification fields (for future use)
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    default: null
  },
  emailVerificationExpiry: {
    type: Date,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
