const User = require("../models/User");

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("watchedMovies", "title genre posterUrl averageRating")
      .populate("watchlist", "title genre posterUrl averageRating");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update preferences (genres, actors)
exports.updatePreferences = async (req, res) => {
  try {
    const { genres, favoriteActors } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        preferences: {
          genres: genres || [],
          favoriteActors: favoriteActors || []
        }
      },
      { new: true }
    ).select("-password");

    res.json({ message: "Preferences updated", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark movie as watched
exports.markWatched = async (req, res) => {
  try {
    const { movieId } = req.body;

    const user = await User.findById(req.user.id);

    if (user.watchedMovies.includes(movieId)) {
      return res.status(400).json({ message: "Movie already marked as watched" });
    }

    // Remove from watchlist if it's there
    user.watchlist = user.watchlist.filter(
      id => id.toString() !== movieId
    );

    user.watchedMovies.push(movieId);
    await user.save();

    res.json({ message: "Movie marked as watched" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add movie to watchlist
exports.addToWatchlist = async (req, res) => {
  try {
    const { movieId } = req.body;

    const user = await User.findById(req.user.id);

    if (user.watchlist.includes(movieId)) {
      return res.status(400).json({ message: "Movie already in watchlist" });
    }

    if (user.watchedMovies.includes(movieId)) {
      return res.status(400).json({ message: "Movie already watched" });
    }

    user.watchlist.push(movieId);
    await user.save();

    res.json({ message: "Movie added to watchlist" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};