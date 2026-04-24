const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  chatRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ChatRoom",
    required: true
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }]
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);
