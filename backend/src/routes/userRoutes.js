const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  getProfile,
  updatePreferences,
  markWatched,
  addToWatchlist
} = require("../controllers/userController");

router.get("/profile", protect, getProfile);
router.put("/preferences", protect, updatePreferences);
router.post("/watched", protect, markWatched);
router.post("/watchlist", protect, addToWatchlist);

module.exports = router;