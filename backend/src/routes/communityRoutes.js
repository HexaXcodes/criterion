const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const isCommunityAdmin = require("../middleware/communityAdminMiddleware");
const {
  createCommunity,
  getAllCommunities,
  getCommunity,
  joinCommunity,
  leaveCommunity,
  promoteToAdmin,
  removeMember,
  updateRules,
  createPost,
  getCommunityPosts,
  upvotePost,
  deletePost
} = require("../controllers/communityController");

router.post("/", protect, createCommunity);
router.get("/", getAllCommunities);
router.get("/:id", getCommunity);
router.post("/:id/join", protect, joinCommunity);
router.post("/:id/leave", protect, leaveCommunity);

// Admin only routes
router.post("/:id/promote", protect, isCommunityAdmin, promoteToAdmin);
router.post("/:id/remove-member", protect, isCommunityAdmin, removeMember);
router.put("/:id/rules", protect, isCommunityAdmin, updateRules);

// Posts
router.post("/:id/posts", protect, createPost);
router.get("/:id/posts", getCommunityPosts);
router.post("/:id/posts/:postId/upvote", protect, upvotePost);
router.delete("/:id/posts/:postId", protect, isCommunityAdmin, deletePost);

module.exports = router;