const { GoogleGenerativeAI } = require("@google/generative-ai");
const User = require("../models/User");
const Movie = require("../models/Movie");
const http = require("http");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getMLRecommendations = (genres, watchedIds, likedGenres, options = {}) => {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      genres,
      watchedIds,
      likedGenres,
      excludeIds: options.excludeIds || watchedIds,
      watchlistGenres: options.watchlistGenres || [],
      tasteTexts: options.tasteTexts || [],
      languages: options.languages || ["en"]
    });

    const requestOptions = {
      hostname: "localhost",
      port: 5001,
      path: "/recommend",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload)
      }
    };

    const req = http.request(requestOptions, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve(JSON.parse(data)));
    });

    req.on("error", reject);
    req.write(payload);
    req.end();
  });
};

const getMLHealth = () => {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: "localhost",
        port: 5001,
        path: "/health",
        method: "GET",
        timeout: 1500
      },
      (res) => {
        let data = "";
        res.on("data", chunk => data += chunk);
        res.on("end", () => {
          try {
            resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, data: JSON.parse(data) });
          } catch {
            resolve({ ok: false, data: null });
          }
        });
      }
    );

    req.on("timeout", () => {
      req.destroy(new Error("ML service timed out"));
    });
    req.on("error", reject);
    req.end();
  });
};

// Build a rich taste profile from user doc + high-rated reviews
const buildUserProfile = (user, highRatedReviews) => {
  const likedMovies = highRatedReviews
    .filter(r => r.movie)
    .map(r => ({
      title: r.movie.title,
      rating: r.rating,
      genres: r.movie.genre || []
    }));

  const likedGenres = likedMovies.flatMap(m => m.genres);

  const likedMoviesText = likedMovies.length > 0
    ? likedMovies
        .map(m => `"${m.title}" (${m.rating}/5, ${m.genres.join("/")} )`)
        .join("; ")
    : "No reviews yet";

  return {
    likedMovies,
    likedGenres,
    likedMoviesText,
    watchedCount: user.watchedMovies.length,
    preferenceGenres: user.preferences.genres,
    favoriteActors: user.preferences.favoriteActors || []
  };
};

const buildWatchlistProfile = async (user) => {
  const watchlistIds = user.watchlist.map(id => id.toString());
  if (watchlistIds.length === 0) {
    return { watchlistIds, watchlistGenres: [], tasteTexts: [] };
  }

  const watchlistMovies = await Movie.find({ _id: { $in: watchlistIds } })
    .select("title genre description")
    .lean();

  return {
    watchlistIds,
    watchlistGenres: watchlistMovies.flatMap(m => m.genre || []),
    tasteTexts: watchlistMovies.map(m =>
      [m.title, ...(m.genre || []), m.description || ""].join(" ")
    )
  };
};

// Generate a rich, personalized 4-5 sentence explanation for a movie
const generateDetailedExplanation = async (model, user, profile, movie, movieDoc) => {
  const descLine = movieDoc?.description ? `- Plot summary: ${movieDoc.description}` : "";
  const yearLine = movieDoc?.releaseYear ? `- Release year: ${movieDoc.releaseYear}` : "";
  const actorsLine = profile.favoriteActors.length > 0
    ? `- Favourite actors: ${profile.favoriteActors.join(", ")}`
    : "";

  const prompt = `You are a deeply knowledgeable, enthusiastic movie expert writing a personalized recommendation for a specific user. Your goal is to make them genuinely excited to watch this film.

USER PROFILE:
- Name: ${user.name}
- Favourite genres: ${profile.preferenceGenres.length > 0 ? profile.preferenceGenres.join(", ") : "not set"}
${actorsLine}
- Movies they loved (title, rating, genres): ${profile.likedMoviesText}
- Total movies watched: ${profile.watchedCount}

RECOMMENDED MOVIE:
- Title: ${movie.title}
- Genres: ${movie.genre.join(", ")}
${yearLine}
${descLine}
- Community rating: ${movie.averageRating}/5
- Taste match score: ${(movie.similarityScore * 100).toFixed(0)}%

INSTRUCTIONS:
Write exactly 4-5 sentences addressed directly to ${user.name} (use "you"/"your"). Each sentence must add something specific:
1. Open with a vivid hook that names a specific movie they loved and connects it emotionally or thematically to "${movie.title}" — don't be generic.
2. Dig into WHY the connection works: shared tone, narrative style, themes, pacing, or atmosphere — be precise, not vague.
3. Highlight something uniquely compelling about "${movie.title}" itself that aligns with their demonstrated taste (genres, rating patterns, or actor preferences if relevant).
4. If they have favourite actors or the film has standout performances relevant to their taste, weave that in. Otherwise, mention a specific craft element (cinematography, score, direction) that fans of their liked movies tend to appreciate.
5. Close with a forward-looking sentence that builds genuine anticipation — what feeling or experience they can expect.

HARD RULES:
- Never open with "Based on", "Because", "Since", "As a", or "Given".
- Never be generic — every sentence must be grounded in their specific profile.
- No bullet points, no headers. Flowing paragraph only.
- Warm, conversational, second-person tone throughout.`;

  const response = await model.generateContent(prompt);
  return response.response.text().trim();
};

// Generate a tight 2-sentence watchlist-add reason
const generateWatchlistReason = async (model, user, profile, movie, movieDoc) => {
  const descLine = movieDoc?.description ? `- Description: ${movieDoc.description}` : "";
  const yearLine = movieDoc?.releaseYear ? `- Year: ${movieDoc.releaseYear}` : "";

  const prompt = `You are a movie recommendation expert. Write exactly 2 punchy, specific sentences telling ${user.name} why "${movie.title}" was added to their watchlist.

USER TASTE:
- Favourite genres: ${profile.preferenceGenres.join(", ") || "not set"}
- Loved movies: ${profile.likedMoviesText}

MOVIE:
- Genres: ${movie.genre.join(", ")}
${yearLine}
${descLine}
- Taste match: ${(movie.similarityScore * 100).toFixed(0)}%

Sentence 1: Name a specific movie they loved and draw a direct connection to this one.
Sentence 2: Say what makes this film worth their time given their specific tastes.
Second person, warm, direct. Never start with "Based on" or "Because".`;

  const response = await model.generateContent(prompt);
  return response.response.text().trim();
};

// Agentic feature — auto-add top 3 recommendations to watchlist on login
exports.autoPopulateWatchlist = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    const Review = require("../models/Review");

    const highRatedReviews = await Review.find({
      user: userId,
      rating: { $gte: 4 }
    }).populate("movie", "genre title");

    const profile = buildUserProfile(user, highRatedReviews);

    const watchedIds = user.watchedMovies.map(id => id.toString());
    const watchlistIds = user.watchlist.map(id => id.toString());
    const watchlistProfile = await buildWatchlistProfile(user);

    const result = await getMLRecommendations(
      user.preferences.genres,
      watchedIds,
      profile.likedGenres,
      {
        excludeIds: [...new Set([...watchedIds, ...watchlistIds])],
        watchlistGenres: watchlistProfile.watchlistGenres,
        tasteTexts: watchlistProfile.tasteTexts,
        languages: user.preferences.languages || ["en"]
      }
    );

    if (!result.recommendations) return null;

    const newMovies = result.recommendations.filter(movie =>
      !watchlistIds.includes(movie.id) &&
      !watchedIds.includes(movie.id)
    ).slice(0, 3);

    if (newMovies.length === 0) return [];

    for (const movie of newMovies) {
      user.watchlist.push(movie.id);
    }
    await user.save();

    const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const moviesWithReasons = await Promise.all(
      newMovies.map(async (movie) => {
        const movieDoc = await Movie.findById(movie.id)
          .select("description releaseYear")
          .lean()
          .catch(() => null);

        let reason;
        try {
          reason = await generateWatchlistReason(geminiModel, user, profile, movie, movieDoc);
        } catch {
          reason = `A strong match for your taste in ${movie.genre.join(" and ")} films.`;
        }

        return { title: movie.title, genre: movie.genre, reason };
      })
    );

    return moviesWithReasons;
  } catch (error) {
    console.error("Auto watchlist error:", error.message);
    return null;
  }
};

// Fall back to personalized DB movies based on preferred, liked, and watchlist genres and language
const getFallbackMovies = async (preferredGenres = [], excludedIds = [], limit = 5, preferredLanguages = ["en"], likedGenres = [], watchlistGenres = []) => {
  const filter = {};
  if (preferredLanguages && preferredLanguages.length > 0) {
    filter.language = { $in: [...preferredLanguages, null, ""] };
  }
  if (excludedIds && excludedIds.length > 0) {
    filter._id = { $nin: excludedIds };
  }

  // Get a larger pool of candidate movies matching language/exclusion criteria
  // We sort by averageRating desc to get high-quality candidates, but we will rank them based on preferences
  let candidates = await Movie.find(filter)
    .sort({ averageRating: -1 })
    .limit(150)
    .lean();

  // Score candidates in memory
  const scored = candidates.map(m => {
    let score = 0;
    const movieGenres = m.genre || [];

    // 1. Genre matching
    movieGenres.forEach(g => {
      // High weight for genres user has actively liked (via high-rated reviews)
      if (likedGenres.includes(g)) {
        score += 5.0;
      }
      // Weight for watchlist genres
      if (watchlistGenres.includes(g)) {
        score += 3.0;
      }
      // Weight for preferred genres (from preference list)
      if (preferredGenres.includes(g)) {
        score += 1.5;
      }
    });

    // If movie doesn't overlap with any of user's preferred or liked/watchlist genres, penalize it heavily
    const hasOverlap = movieGenres.some(g =>
      likedGenres.includes(g) || watchlistGenres.includes(g) || preferredGenres.includes(g)
    );
    if (!hasOverlap && (preferredGenres.length > 0 || likedGenres.length > 0)) {
      score -= 15.0;
    }

    // 2. Language match boost
    if (preferredLanguages.includes(m.language)) {
      score += 3.0;
    } else if (!m.language) {
      score += 0.5; // legacy movie
    }

    // 3. Rating quality as a minor tie-breaker (max 1.0)
    const rating = m.averageRating || 0;
    score += (rating / 5.0) * 1.0;

    return { movie: m, score };
  });

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  const selected = scored.slice(0, limit).map(s => s.movie);

  return selected.map(m => ({
    id: m._id.toString(),
    _id: m._id.toString(),
    title: m.title,
    genre: m.genre || [],
    posterUrl: m.posterUrl,
    averageRating: m.averageRating,
    description: m.description,
    releaseYear: m.releaseYear,
    language: m.language,
    similarityScore: 0.7
  }));
};

// Get full recommendations with rich, personalized AI explanations
exports.getRecommendationsWithExplanations = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const Review = require("../models/Review");

    const highRatedReviews = await Review.find({
      user: req.user.id,
      rating: { $gte: 4 }
    }).populate("movie", "genre title");

    const profile = buildUserProfile(user, highRatedReviews);
    const excludeParam = req.query.exclude ? req.query.exclude.split(',').filter(Boolean) : []
    const watchedIds = [...new Set([
      ...user.watchedMovies.map(id => id.toString()),
      ...excludeParam
    ])]
    const watchlistProfile = await buildWatchlistProfile(user);
    const excludedIds = [...new Set([...watchedIds, ...watchlistProfile.watchlistIds])];
    const fallbackGenres = [
      ...(user.preferences.genres || []),
      ...watchlistProfile.watchlistGenres
    ];

    const userLanguages = user.preferences.languages && user.preferences.languages.length > 0
      ? user.preferences.languages
      : ["en"];

    let recommendations;
    try {
      const result = await getMLRecommendations(
        user.preferences.genres,
        watchedIds,
        profile.likedGenres,
        {
          excludeIds: excludedIds,
          watchlistGenres: watchlistProfile.watchlistGenres,
          tasteTexts: watchlistProfile.tasteTexts,
          languages: userLanguages
        }
      );
      recommendations = result.recommendations && result.recommendations.length > 0
        ? result.recommendations.slice(0, 5)
        : await getFallbackMovies(
            user.preferences.genres,
            excludedIds,
            5,
            userLanguages,
            profile.likedGenres,
            watchlistProfile.watchlistGenres
          );
    } catch {
      recommendations = await getFallbackMovies(
        user.preferences.genres,
        excludedIds,
        5,
        userLanguages,
        profile.likedGenres,
        watchlistProfile.watchlistGenres
      );
    }

    const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const recommendationsWithExplanations = await Promise.all(
      recommendations.map(async (movie) => {
        const movieDoc = await Movie.findById(movie.id || movie._id)
          .select("description releaseYear")
          .lean()
          .catch(() => null);

        try {
          const explanation = await generateDetailedExplanation(
            geminiModel, user, profile, movie, movieDoc
          );
          return { ...movie, explanation };
        } catch {
          const genres = Array.isArray(movie.genre) ? movie.genre : [];
          return {
            ...movie,
            explanation: genres.length > 0
              ? `A strong pick for your taste in ${genres.join(" and ")} films.`
              : `A top-rated pick we think you'll enjoy.`
          };
        }
      })
    );

    res.json({ recommendations: recommendationsWithExplanations });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRecommendationHealth = async (req, res) => {
  try {
    const health = await getMLHealth();
    res.json({
      mlService: health.ok ? "online" : "unhealthy",
      fallback: !health.ok,
      detail: health.data
    });
  } catch (error) {
    res.json({
      mlService: "offline",
      fallback: true,
      message: error.message
    });
  }
};
