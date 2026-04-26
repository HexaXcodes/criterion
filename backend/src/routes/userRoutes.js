const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  getProfile,
  updatePreferences,
  markWatched,
  addToWatchlist,
  getLeaderboard
} = require("../controllers/userController");

router.get("/leaderboard", getLeaderboard);
router.get("/profile", protect, getProfile);
router.put("/preferences", protect, updatePreferences);
router.post("/watched", protect, markWatched);
router.post("/watchlist", protect, addToWatchlist);
router.get("/streak", protect, async (req, res) => {
  try {
    const User = require("../models/User");
    const user = await User.findById(req.user.id).select("streak points name");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;