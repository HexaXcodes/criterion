const mongoose = require("mongoose");

const communitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String
  },
  genre: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  memberCount: {
    type: Number,
    default: 0
  },
  rules: {
    type: [String],
    default: []
  },
  isPrivate: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model("Community", communitySchema);