const { GoogleGenerativeAI } = require("@google/generative-ai");
const User = require("../models/User");
const http = require("http");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper to call ML service
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

// Option B — Auto add top 3 recommendations to watchlist
exports.autoPopulateWatchlist = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const watchedIds = user.watchedMovies.map(id => id.toString());
    const watchlistIds = user.watchlist.map(id => id.toString());

    const result = await getMLRecommendations(
      user.preferences.genres,
      watchedIds,
      []
    );

    if (!result.recommendations) return;

    // Filter out movies already in watchlist or watched
    const newMovies = result.recommendations.filter(movie =>
      !watchlistIds.includes(movie.id) &&
      !watchedIds.includes(movie.id)
    ).slice(0, 3);

    if (newMovies.length === 0) return;

    // Add to watchlist
    for (const movie of newMovies) {
      user.watchlist.push(movie.id);
    }

    await user.save();

    return newMovies.map(m => ({ title: m.title, genre: m.genre }));
  } catch (error) {
    console.error("Auto watchlist error:", error.message);
    return null;
  }
};

// Option D — AI explanation for recommendations
exports.getRecommendationsWithExplanations = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const Review = require("../models/Review");

    // Get liked genres from high rated reviews
    const highRatedReviews = await Review.find({
      user: req.user.id,
      rating: { $gte: 4 }
    }).populate("movie", "genre title");

    const likedGenres = [];
    const likedMovies = [];

    highRatedReviews.forEach(review => {
      if (review.movie) {
        likedGenres.push(...(review.movie.genre || []));
        likedMovies.push(`${review.movie.title} (${review.rating}/5)`);
      }
    });

    const watchedIds = user.watchedMovies.map(id => id.toString());

    // Get ML recommendations
    const result = await getMLRecommendations(
      user.preferences.genres,
      watchedIds,
      likedGenres
    );

    if (!result.recommendations) {
      return res.status(500).json({ message: "ML service unavailable" });
    }

    const recommendations = result.recommendations.slice(0, 5);

    // Generate AI explanations using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const recommendationsWithExplanations = await Promise.all(
      recommendations.map(async (movie) => {
        try {
          const prompt = `
You are a movie recommendation assistant. Explain in 2-3 sentences why this movie is recommended for this user.

User's favourite genres: ${user.preferences.genres.join(", ")}
Movies they loved: ${likedMovies.length > 0 ? likedMovies.join(", ") : "No reviews yet"}
Recommended movie: ${movie.title}
Movie genres: ${movie.genre.join(", ")}
Similarity score: ${movie.similarityScore}

Write a personal, conversational explanation. Do not start with "Based on" or "Because". Be specific about what connects the user's taste to this movie.
`;

          const response = await model.generateContent(prompt);
          const explanation = response.response.text();

          return {
            ...movie,
            explanation: explanation.trim()
          };
        } catch (err) {
          return {
            ...movie,
            explanation: `Recommended based on your interest in ${movie.genre.join(" and ")} films.`
          };
        }
      })
    );

    res.json({
      recommendations: recommendationsWithExplanations
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};