const Movie = require("../models/Movie");

exports.addMovie = async (req, res) => {
  try {
    const { title, description, genre, releaseYear, posterUrl } = req.body;
    const movie = await Movie.create({
      title,
      description,
      genre,
      releaseYear,
      posterUrl,
    });
    res.status(201).json({ message: "Movie added successfully", movie });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllMovies = async (req, res) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Search movies by title or genre
exports.searchMovies = async (req, res) => {
  try {
    const { query, genre } = req.query;

    const filter = {};

    if (query) {
      filter.title = { $regex: query, $options: "i" };
    }

    if (genre) {
      filter.genre = { $in: [genre] };
    }

    const movies = await Movie.find(filter)
      .sort({ averageRating: -1 })
      .limit(20);

    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const https = require("http");

exports.getRecommendations = async (req, res) => {
  try {
    const User = require("../models/User");
    const Review = require("../models/Review");
    const MovieModel = require("../models/Movie");

    const user = await User.findById(req.user.id);

    // Get genres from movies the user rated 4 or 5
    const highRatedReviews = await Review.find({
      user: req.user.id,
      rating: { $gte: 4 }
    }).populate("movie", "genre");

    const likedGenres = [];
    highRatedReviews.forEach(review => {
      if (review.movie && review.movie.genre) {
        likedGenres.push(...review.movie.genre);
      }
    });

    const payload = JSON.stringify({
      genres: user.preferences.genres,
      watchedIds: user.watchedMovies.map(id => id.toString()),
      likedGenres: likedGenres
    });

    const options = {
      hostname: "localhost",
      port: 5001,
      path: "/recommend",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload)
      }
    };

    const http = require("http");
    const mlReq = http.request(options, (mlRes) => {
      let data = "";
      mlRes.on("data", chunk => data += chunk);
      mlRes.on("end", () => {
        const result = JSON.parse(data);
        res.json(result);
      });
    });

    mlReq.on("error", (err) => {
      res.status(500).json({ message: "ML service unavailable: " + err.message });
    });

    mlReq.write(payload);
    mlReq.end();

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};