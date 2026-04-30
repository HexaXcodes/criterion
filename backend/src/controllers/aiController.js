const { GoogleGenerativeAI } = require("@google/generative-ai");
const User = require("../models/User");
const Movie = require("../models/Movie");
const http = require("http");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getMLRecommendations = (genres, watchedIds, likedGenres) => {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ genres, watchedIds, likedGenres });

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

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve(JSON.parse(data)));
    });

    req.on("error", reject);
    req.write(payload);
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

    const result = await getMLRecommendations(
      user.preferences.genres,
      watchedIds,
      profile.likedGenres
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

    const watchedIds = user.watchedMovies.map(id => id.toString());

    const result = await getMLRecommendations(
      user.preferences.genres,
      watchedIds,
      profile.likedGenres
    );

    if (!result.recommendations) {
      return res.status(500).json({ message: "ML service unavailable" });
    }

    const recommendations = result.recommendations.slice(0, 5);
    const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const recommendationsWithExplanations = await Promise.all(
      recommendations.map(async (movie) => {
        const movieDoc = await Movie.findById(movie.id)
          .select("description releaseYear")
          .lean()
          .catch(() => null);

        try {
          const explanation = await generateDetailedExplanation(
            geminiModel, user, profile, movie, movieDoc
          );
          return { ...movie, explanation };
        } catch {
          return {
            ...movie,
            explanation: `A strong pick for your taste in ${movie.genre.join(" and ")} films.`
          };
        }
      })
    );

    res.json({ recommendations: recommendationsWithExplanations });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
