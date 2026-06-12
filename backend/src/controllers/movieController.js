const Movie = require("../models/Movie");
const https = require("https");

// Helper: HTTPS GET with optional headers, returns a Promise<object>
// Rejects on non-2xx HTTP status so callers get real errors instead of TMDB error bodies
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
        try {
          const body = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(body);
          } else {
            reject(new Error(`TMDB ${res.statusCode}: ${body.status_message || JSON.stringify(body)}`));
          }
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on("error", reject);
    req.end();
  });

// Helper: HTTP GET for raw text response (useful for scraping/fallbacks)
const httpsGetRaw = (url) =>
  new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      }
    };
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });
    req.on("error", reject);
    req.end();
  });

// Helper: Scrape YouTube to find first video ID for a trailer query
const getYoutubeScrapedKey = async (title, year) => {
  try {
    const searchQuery = encodeURIComponent(`${title} ${year || ''} official trailer`);
    const url = `https://www.youtube.com/results?search_query=${searchQuery}`;
    const html = await httpsGetRaw(url);
    const match = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
    const altMatch = html.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/);
    return (match && match[1]) || (altMatch && altMatch[1]) || null;
  } catch (err) {
    console.error("YouTube scraper fallback failed:", err.message);
    return null;
  }
};

const NSFW_REGEX = /sex|bikini|swapping|affair|erotic|erotica|sensual|adult|18\+|nsfw|uncensored|kamasutra|softcore|seduce|seduction|naked|mistress|porn/i;
const getSafeFilter = (baseFilter = {}, bypassRegex = false) => {
  const filter = { ...baseFilter, isNSFW: { $ne: true } };
  if (!bypassRegex) {
    filter.title = { $not: NSFW_REGEX };
    filter.description = { $not: NSFW_REGEX };
  }
  return filter;
};

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
    const q = Movie.find(getSafeFilter()).sort(sort);
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
    if (req.query.lang && req.query.lang !== 'all') {
      filter.language = req.query.lang === 'en'
        ? { $in: ['en', null] }
        : req.query.lang;
    }

    const langs = req.query.langs ? req.query.langs.split(",").filter(Boolean) : [];
    const safeFilter = getSafeFilter(filter, !!query);
    const total = await Movie.countDocuments(safeFilter);

    let movies;
    if (langs.length > 0) {
      // Preferred-language movies first, then rest — within each group keep the chosen sort
      const [sortKey] = Object.keys(sortOrder);
      const [sortDir] = Object.values(sortOrder);
      movies = await Movie.aggregate([
        { $match: safeFilter },
        { $addFields: { _langPrio: { $cond: [{ $in: ["$language", langs] }, 0, 1] } } },
        { $sort: { _langPrio: 1, [sortKey]: sortDir } },
        { $skip: skip },
        { $limit: limit },
        { $project: { _langPrio: 0 } },
      ]);
    } else {
      movies = await Movie.find(safeFilter).sort(sortOrder).skip(skip).limit(limit);
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

    const filter = getSafeFilter({ _id: { $nin: watchedIds } });
    if (preferredGenres.length > 0) filter.genre = { $in: preferredGenres };

    let movies = await MovieModel.find(filter).sort({ averageRating: -1 }).limit(5).lean();

    if (movies.length < 5) {
      const seenIds = movies.map(m => m._id.toString());
      const extra = await MovieModel.find(getSafeFilter({ _id: { $nin: [...watchedIds, ...seenIds] } }))
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
        const baseFilter = getSafeFilter({ genre: { $in: [genre] }, posterUrl: { $ne: "" } });
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

      // Try with year first, fall back to title-only so year mismatches don't block us
      const searches = movie.releaseYear
        ? [
            `https://api.themoviedb.org/3/search/movie?query=${query}&year=${movie.releaseYear}`,
            `https://api.themoviedb.org/3/search/movie?query=${query}`,
          ]
        : [`https://api.themoviedb.org/3/search/movie?query=${query}`];

      for (const url of searches) {
        try {
          const searchData = await httpsGet(url, authHeaders);
          if (searchData.results && searchData.results.length > 0) {
            tmdbId = searchData.results[0].id;
            await Movie.findByIdAndUpdate(req.params.id, { tmdbId });
            break;
          }
        } catch (_) {
          // try next search variant
        }
      }
    }

    let youtubeKey = null;
    let trailerTitle = `${movie.title} Trailer`;

    if (tmdbId) {
      try {
        const videosData = await httpsGet(
          `https://api.themoviedb.org/3/movie/${tmdbId}/videos?language=en-US`,
          authHeaders
        );

        const trailer =
          videosData.results?.find((v) => v.type === "Trailer" && v.site === "YouTube") ||
          videosData.results?.find((v) => v.type === "Teaser" && v.site === "YouTube") ||
          videosData.results?.find((v) => v.site === "YouTube");

        if (trailer) {
          youtubeKey = trailer.key;
          trailerTitle = trailer.name;
        }
      } catch (err) {
        console.error("TMDB videos fetch failed:", err.message);
      }
    }

    // Fallback if TMDB couldn't find a trailer
    if (!youtubeKey) {
      youtubeKey = await getYoutubeScrapedKey(movie.title, movie.releaseYear);
    }

    if (!youtubeKey) {
      return res.status(404).json({ message: "No trailer found for this title" });
    }

    res.json({ youtubeKey, title: trailerTitle });
  } catch (error) {
    console.error("Trailer fetch error:", error.message);
    res.status(500).json({ message: error.message });
  }
};