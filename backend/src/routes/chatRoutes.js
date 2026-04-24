const express = require("express");
const router = express.Router({ mergeParams: true });
const protect = require("../middleware/authMiddleware");
const {
  createChatRoom,
  getChatRooms,
  getMessages
} = require("../controllers/chatController");

router.post("/", protect, createChatRoom);
router.get("/", getChatRooms);
router.get("/:roomId/messages", protect, getMessages);

module.exports = router;