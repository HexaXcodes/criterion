const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const { addReview, getReviewsByMovie } = require("../controllers/reviewController");

router.post("/", protect, addReview);
router.get("/:movieId", getReviewsByMovie);

module.exports = router;