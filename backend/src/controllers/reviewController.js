const Review = require("../models/Review");
const Movie = require("../models/Movie");
const User = require("../models/User");
exports.addReview = async (req, res) => {
  try {
    console.log("Body:", req.body);
    console.log("User:", req.user);
    
    const movieId = req.body.movieId;
    const rating = req.body.rating;
    const comment = req.body.comment;

    const movie = await Movie.findById(movieId);
    if (!movie) return res.status(404).json({ message: "Movie not found" });

    const review = await Review.create({
      user: req.user.id,
      movie: movieId,
      rating,
      comment,
    });

    const allReviews = await Review.find({ movie: movieId });
    const avg =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await Movie.findByIdAndUpdate(movieId, { averageRating: avg.toFixed(1) });
    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { watchedMovies: movieId },
      $pull: { watchlist: movieId }
    });

    res.status(201).json({ message: "Review added", review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getReviewsByMovie = async (req, res) => {
  try {
    const reviews = await Review.find({ movie: req.params.movieId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
