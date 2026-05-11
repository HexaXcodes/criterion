const mongoose = require("mongoose");
const dotenv = require("dotenv");
const https = require("https");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const Movie = require("../models/Movie");

const TMDB_TOKEN = process.env.TMDB_API_KEY;

const genreMap = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const tmdbGet = (path, retries = 3) =>
  new Promise((resolve, reject) => {
    const url = new URL(`https://api.themoviedb.org/3${path}`);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: "GET",
      headers: {
        Authorization: `Bearer ${TMDB_TOKEN}`,
        accept: "application/json",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on("error", async (err) => {
      if (retries > 0) {
        await sleep(2000);
        resolve(tmdbGet(path, retries - 1));
      } else {
        reject(err);
      }
    });

    req.setTimeout(12000, () => req.destroy());
    req.end();
  });

const mapMovie = (m) => ({
  title: m.title,
  description: m.overview,
  genre: (m.genre_ids || []).map((id) => genreMap[id]).filter(Boolean),
  releaseYear: m.release_date ? parseInt(m.release_date.split("-")[0]) : null,
  posterUrl: m.poster_path
    ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
    : "",
  averageRating: parseFloat(((m.vote_average || 0) / 2).toFixed(1)),
  language: m.original_language || "en",
  tmdbId: m.id,
});

const saveMovies = async (movies) => {
  let saved = 0;
  for (const movie of movies) {
    if (!movie.tmdbId || !movie.title) continue;
    await Movie.updateOne(
      { tmdbId: movie.tmdbId },
      { $set: movie },
      { upsert: true }
    );
    saved++;
  }
  return saved;
};

const fetchEndpoint = async (basePath, totalPages, label) => {
  let total = 0;
  for (let page = 1; page <= totalPages; page++) {
    const sep = basePath.includes("?") ? "&" : "?";
    const data = await tmdbGet(`${basePath}${sep}language=en-US&page=${page}`);
    if (!data.results || data.results.length === 0) break;

    const saved = await saveMovies(data.results.map(mapMovie));
    total += saved;
    process.stdout.write(`\r  ${label} — page ${page}/${Math.min(totalPages, data.total_pages || totalPages)} | saved ${total}`);

    await sleep(220);
  }
  console.log();
  return total;
};

const seedMovies = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected\n");

    let grand = 0;

    // 1. Popular movies (500 pages = up to 10 000 entries, TMDB caps at 500)
    console.log("Fetching popular movies...");
    grand += await fetchEndpoint("/movie/popular", 500, "popular");

    // 2. Top-rated movies
    console.log("Fetching top-rated movies...");
    grand += await fetchEndpoint("/movie/top_rated", 500, "top_rated");

    // 3. Now playing
    console.log("Fetching now-playing movies...");
    grand += await fetchEndpoint("/movie/now_playing", 100, "now_playing");

    // 4. Upcoming
    console.log("Fetching upcoming movies...");
    grand += await fetchEndpoint("/movie/upcoming", 100, "upcoming");

    // 5. Per-genre discovery — ensures every genre has deep coverage
    const genreIds = Object.keys(genreMap).filter((id) => id !== "10770"); // skip TV Movie
    console.log(`\nFetching per-genre discovery (${genreIds.length} genres × 15 pages)...`);
    for (const gid of genreIds) {
      const name = genreMap[gid];
      console.log(`  Genre: ${name} (${gid})`);
      grand += await fetchEndpoint(
        `/discover/movie?with_genres=${gid}&sort_by=vote_average.desc&vote_count.gte=100`,
        15,
        name
      );
    }

    console.log(`\nSeeding complete. Total upserts: ${grand}`);
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
};

seedMovies();
