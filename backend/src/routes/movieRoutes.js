const express = require("express");
const router = express.Router();
const {
  addMovie,
  getAllMovies,
  getMovieById,
  searchMovies,
  getRecommendations,
  getMovieTrailer,
  getGenreSections,
} = require("../controllers/movieController");
const { getRecommendationsWithExplanations, getRecommendationHealth } = require("../controllers/aiController");
const protect = require("../middleware/authMiddleware");

router.post("/", addMovie);
router.get("/search", searchMovies);
router.get("/genre-sections", getGenreSections);
router.get("/recommendations", protect, getRecommendations);
router.get("/recommendations/explained", protect, getRecommendationsWithExplanations);
router.get("/recommendations/health", protect, getRecommendationHealth);
router.get("/", getAllMovies);
router.get("/:id/trailer", getMovieTrailer);
router.get("/:id", getMovieById);

module.exports = router;
