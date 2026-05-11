const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Community",
    required: true
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  upvoteCount: {
    type: Number,
    default: 0
  },
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Movie",
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model("Post", postSchema);