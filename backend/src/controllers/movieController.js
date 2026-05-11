const Movie = require("../models/Movie");
const https = require("https");

// Helper: HTTPS GET with optional headers, returns a Promise<object>
const httpsGet = (url, headers = {}) =>
  new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: "GET",
      headers,
    };
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    });
    req.on("error", reject);
    req.end();
  });

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
    const limit = parseInt(req.query.limit) || 0;
    const sort = req.query.sort === 'rating'
      ? { averageRating: -1 }
      : { createdAt: -1 };
    const q = Movie.find().sort(sort);
    if (limit) q.limit(limit);
    const movies = await q;
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
// Search movies by title or genre with pagination and sorting
exports.searchMovies = async (req, res) => {
  try {
    const { query, genre } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 40);
    const skip = (page - 1) * limit;

    const sortMap = {
      rating_desc: { averageRating: -1 },
      rating_asc:  { averageRating: 1 },
      alpha:       { title: 1 },
      alpha_desc:  { title: -1 },
      newest:      { releaseYear: -1 },
    };
    const sortOrder = sortMap[req.query.sort] || { averageRating: -1 };

    const filter = {};
    if (query) filter.title = { $regex: query, $options: "i" };
    if (genre) filter.genre = { $in: [genre] };

    const langs = req.query.langs ? req.query.langs.split(",").filter(Boolean) : [];
    const total = await Movie.countDocuments(filter);

    let movies;
    if (langs.length > 0) {
      // Preferred-language movies first, then rest — within each group keep the chosen sort
      const [sortKey] = Object.keys(sortOrder);
      const [sortDir] = Object.values(sortOrder);
      movies = await Movie.aggregate([
        { $match: filter },
        { $addFields: { _langPrio: { $cond: [{ $in: ["$language", langs] }, 0, 1] } } },
        { $sort: { _langPrio: 1, [sortKey]: sortDir } },
        { $skip: skip },
        { $limit: limit },
        { $project: { _langPrio: 0 } },
      ]);
    } else {
      movies = await Movie.find(filter).sort(sortOrder).skip(skip).limit(limit);
    }

    res.json({ movies, total, page, limit });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const serveFallback = async (user, res) => {
  try {
    const MovieModel = require("../models/Movie");
    const watchedIds = user.watchedMovies.map(id => id.toString());
    const preferredGenres = user.preferences.genres || [];

    const filter = { _id: { $nin: watchedIds } };
    if (preferredGenres.length > 0) filter.genre = { $in: preferredGenres };

    let movies = await MovieModel.find(filter).sort({ averageRating: -1 }).limit(5).lean();

    if (movies.length < 5) {
      const seenIds = movies.map(m => m._id.toString());
      const extra = await MovieModel.find({ _id: { $nin: [...watchedIds, ...seenIds] } })
        .sort({ averageRating: -1 }).limit(5 - movies.length).lean();
      movies = [...movies, ...extra];
    }

    res.json({
      recommendations: movies.map(m => ({
        id: m._id.toString(),
        title: m.title,
        genre: m.genre || [],
        posterUrl: m.posterUrl,
        averageRating: m.averageRating,
        similarityScore: 0.7
      }))
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

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
        try {
          const result = JSON.parse(data);
          if (result.recommendations && result.recommendations.length > 0) {
            return res.json(result);
          }
        } catch {}
        // ML result empty or unparseable — fall back to DB
        serveFallback(user, res);
      });
    });

    mlReq.on("error", () => serveFallback(user, res));

    mlReq.write(payload);
    mlReq.end();

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const BROWSABLE_GENRES = [
  "Action","Adventure","Animation","Comedy","Crime","Documentary",
  "Drama","Family","Fantasy","History","Horror","Music",
  "Mystery","Romance","Sci-Fi","Thriller","War","Western",
];

exports.getGenreSections = async (req, res) => {
  try {
    const limit = Math.min(30, parseInt(req.query.limit) || 10);
    const langs = req.query.langs ? req.query.langs.split(",").filter(Boolean) : [];

    const sections = await Promise.all(
      BROWSABLE_GENRES.map(async (genre) => {
        const baseFilter = { genre: { $in: [genre] }, posterUrl: { $ne: "" } };
        let movies;
        if (langs.length > 0) {
          movies = await Movie.aggregate([
            { $match: baseFilter },
            { $addFields: { _langPrio: { $cond: [{ $in: ["$language", langs] }, 0, 1] } } },
            { $sort: { _langPrio: 1, averageRating: -1 } },
            { $limit: limit },
            { $project: { _langPrio: 0 } },
          ]);
        } else {
          movies = await Movie.find(baseFilter)
            .sort({ averageRating: -1 })
            .limit(limit)
            .lean();
        }
        return { genre, movies };
      })
    );
    res.json(sections.filter((s) => s.movies.length > 0));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMovieTrailer = async (req, res) => {
  try {
    const TMDB_KEY = process.env.TMDB_API_KEY;
    if (!TMDB_KEY) return res.status(500).json({ message: "TMDB API key not configured" });

    const authHeaders = { Authorization: `Bearer ${TMDB_KEY}`, "Content-Type": "application/json" };

    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });

    let tmdbId = movie.tmdbId;

    // Search TMDB by title if no cached tmdbId
    if (!tmdbId) {
      const query = encodeURIComponent(movie.title);
      const yearParam = movie.releaseYear ? `&year=${movie.releaseYear}` : "";
      const searchData = await httpsGet(
        `https://api.themoviedb.org/3/search/movie?query=${query}${yearParam}`,
        authHeaders
      );
      if (searchData.results && searchData.results.length > 0) {
        tmdbId = searchData.results[0].id;
        await Movie.findByIdAndUpdate(req.params.id, { tmdbId });
      }
    }

    if (!tmdbId) return res.status(404).json({ message: "Trailer not found" });

    const videosData = await httpsGet(
      `https://api.themoviedb.org/3/movie/${tmdbId}/videos`,
      authHeaders
    );

    const trailer =
      videosData.results?.find((v) => v.type === "Trailer" && v.site === "YouTube") ||
      videosData.results?.find((v) => v.site === "YouTube");

    if (!trailer) return res.status(404).json({ message: "Trailer not found" });

    res.json({ youtubeKey: trailer.key, title: trailer.name });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};