const express = require("express");
const router = express.Router();
const {
  addMovie,
  getAllMovies,
  getMovieById,
  searchMovies,
  getRecommendations
} = require("../controllers/movieController");
const protect = require("../middleware/authMiddleware");

router.post("/", addMovie);
router.get("/search", searchMovies);
router.get("/recommendations", protect, getRecommendations);
router.get("/", getAllMovies);
router.get("/:id", getMovieById);

module.exports = router;