const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  getProfile,
  updatePreferences,
  markWatched,
  addToWatchlist
} = require("../controllers/userController");
router.get("/streak", protect, async (req, res) => {
  try {
    const User = require("../models/User");
    const user = await User.findById(req.user.id).select("streak points name");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/profile", protect, getProfile);
router.put("/preferences", protect, updatePreferences);
router.post("/watched", protect, markWatched);
router.post("/watchlist", protect, addToWatchlist);

module.exports = router;