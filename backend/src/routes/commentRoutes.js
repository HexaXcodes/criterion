const express = require("express");
const router = express.Router({ mergeParams: true });
const protect = require("../middleware/authMiddleware");
const {
  addComment,
  getComments,
  upvoteComment,
  deleteComment
} = require("../controllers/commentController");

router.post("/", protect, addComment);
router.get("/", getComments);
router.post("/:commentId/upvote", protect, upvoteComment);
router.delete("/:commentId", protect, deleteComment);

module.exports = router;