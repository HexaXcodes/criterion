const mongoose = require("mongoose");
const dotenv = require("dotenv");
const https = require("https");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const Movie = require("../models/Movie");

const TMDB_TOKEN = process.env.TMDB_API_KEY;

const movieGenreMap = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
  10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western",
};

const tvGenreMap = {
  10759: "Action", 16: "Animation", 35: "Comedy", 80: "Crime", 99: "Documentary",
  18: "Drama", 10751: "Family", 10762: "Kids", 9648: "Mystery", 10763: "News",
  10764: "Reality", 10765: "Sci-Fi", 10766: "Soap", 10767: "Talk", 10768: "War",
  37: "Western",
};

// Major world cinema languages (Indian languages handled separately below)
const LANGUAGES = [
  "en", "fr", "ja", "ko", "de", "es", "it", "zh",
  "pt", "ru", "ar", "sv", "da", "nl", "pl", "tr", "th",
  "id", "fa", "he", "ro", "cs", "hu", "fi", "nb", "uk",
];

// Indian regional languages — deep sweep with lower vote threshold
const INDIAN_LANGUAGES = [
  { code: "hi", name: "Hindi" },
  { code: "ta", name: "Tamil" },
  { code: "te", name: "Telugu" },
  { code: "ml", name: "Malayalam" },
  { code: "kn", name: "Kannada" },
  { code: "bn", name: "Bengali" },
  { code: "mr", name: "Marathi" },
  { code: "pa", name: "Punjabi" },
  { code: "gu", name: "Gujarati" },
  { code: "or", name: "Odia" },
  { code: "as", name: "Assamese" },
  { code: "ur", name: "Urdu" },
  { code: "mai", name: "Maithili" },
  { code: "bho", name: "Bhojpuri" },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const tmdbGet = (urlPath, retries = 3) =>
  new Promise((resolve, reject) => {
    const url = new URL(`https://api.themoviedb.org/3${urlPath}`);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: "GET",
      headers: { Authorization: `Bearer ${TMDB_TOKEN}`, accept: "application/json" },
    };
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    });
    req.on("error", async (err) => {
      if (retries > 0) { await sleep(2000); resolve(tmdbGet(urlPath, retries - 1)); }
      else reject(err);
    });
    req.setTimeout(15000, () => req.destroy());
    req.end();
  });

const mapMovie = (m) => ({
  type: "movie",
  title: m.title || m.original_title,
  description: m.overview,
  genre: (m.genre_ids || []).map((id) => movieGenreMap[id]).filter(Boolean),
  releaseYear: m.release_date ? parseInt(m.release_date.split("-")[0]) : null,
  posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : "",
  averageRating: parseFloat(((m.vote_average || 0) / 2).toFixed(1)),
  language: m.original_language || "en",
  tmdbId: m.id,
});

const mapTv = (m) => ({
  type: "tv",
  title: m.name || m.original_name,
  description: m.overview,
  genre: (m.genre_ids || []).map((id) => tvGenreMap[id]).filter(Boolean),
  releaseYear: m.first_air_date ? parseInt(m.first_air_date.split("-")[0]) : null,
  posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : "",
  averageRating: parseFloat(((m.vote_average || 0) / 2).toFixed(1)),
  language: m.original_language || "en",
  tmdbId: m.id,
});

const saveItems = async (items) => {
  let saved = 0;
  for (const item of items) {
    if (!item.tmdbId || !item.title) continue;
    await Movie.updateOne(
      { tmdbId: item.tmdbId, type: item.type },
      { $set: item },
      { upsert: true }
    );
    saved++;
  }
  return saved;
};

let grandTotal = 0;

const fetchEndpoint = async (basePath, totalPages, label, mapper) => {
  let total = 0;
  for (let page = 1; page <= totalPages; page++) {
    try {
      const sep = basePath.includes("?") ? "&" : "?";
      const data = await tmdbGet(`${basePath}${sep}language=en-US&page=${page}`);
      if (!data.results || data.results.length === 0) break;
      if (data.total_pages && page > data.total_pages) break;

      const saved = await saveItems(data.results.map(mapper));
      total += saved;
      grandTotal += saved;
      process.stdout.write(`\r  ${label} p${page}/${Math.min(totalPages, data.total_pages || totalPages)} | +${total} | total ${grandTotal}`);
      await sleep(220);
    } catch {
      await sleep(1000);
    }
  }
  console.log();
  return total;
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected\n");

    // ── MOVIES ───────────────────────────────────────────────────────────────
    console.log("=== MOVIES ===\n");

    console.log("[1] Popular");
    await fetchEndpoint("/movie/popular", 500, "popular", mapMovie);

    console.log("[2] Top Rated");
    await fetchEndpoint("/movie/top_rated", 500, "top_rated", mapMovie);

    console.log("[3] Now Playing");
    await fetchEndpoint("/movie/now_playing", 200, "now_playing", mapMovie);

    console.log("[4] Upcoming");
    await fetchEndpoint("/movie/upcoming", 100, "upcoming", mapMovie);

    // Sort by revenue to catch all blockbusters
    console.log("[5] By Revenue");
    await fetchEndpoint(
      "/discover/movie?sort_by=revenue.desc",
      500, "revenue", mapMovie
    );

    // Sort by vote_count to catch most-reviewed films (critically acclaimed)
    console.log("[6] By Vote Count");
    await fetchEndpoint(
      "/discover/movie?sort_by=vote_count.desc",
      500, "vote_count", mapMovie
    );

    // Per-genre sweeps with multiple sort strategies
    const movieGenreIds = Object.keys(movieGenreMap).filter((id) => id !== "10770");
    console.log(`\n[7] Per-genre by rating (${movieGenreIds.length} genres × 50 pages)`);
    for (const gid of movieGenreIds) {
      await fetchEndpoint(
        `/discover/movie?with_genres=${gid}&sort_by=vote_average.desc`,
        50, movieGenreMap[gid], mapMovie
      );
    }

    console.log(`\n[8] Per-genre by vote count (${movieGenreIds.length} genres × 30 pages)`);
    for (const gid of movieGenreIds) {
      await fetchEndpoint(
        `/discover/movie?with_genres=${gid}&sort_by=vote_count.desc`,
        30, `${movieGenreMap[gid]}_votes`, mapMovie
      );
    }

    // Year-by-year sweep from 1920 to present — catches every acclaimed film from every era
    const currentYear = new Date().getFullYear();
    console.log(`\n[9] Year-by-year sweep (1920–${currentYear})`);
    for (let year = currentYear; year >= 1920; year--) {
      await fetchEndpoint(
        `/discover/movie?primary_release_year=${year}&sort_by=vote_average.desc`,
        10, `${year}`, mapMovie
      );
    }

    // Sweep every major language's top films explicitly
    console.log(`\n[10] Per-language top films (${LANGUAGES.length} languages × 20 pages)`);
    for (const lang of LANGUAGES) {
      await fetchEndpoint(
        `/discover/movie?with_original_language=${lang}&sort_by=vote_average.desc`,
        20, `lang:${lang}`, mapMovie
      );
    }

    // Per-language by vote_count (different set of films)
    console.log(`\n[11] Per-language by vote count`);
    for (const lang of LANGUAGES) {
      await fetchEndpoint(
        `/discover/movie?with_original_language=${lang}&sort_by=vote_count.desc`,
        10, `votes:${lang}`, mapMovie
      );
    }

    // Indian regional languages — dedicated deep sweep
    console.log(`\n[11b] Indian regional cinema (${INDIAN_LANGUAGES.length} languages)`);
    for (const { code, name } of INDIAN_LANGUAGES) {
      // By rating
      await fetchEndpoint(
        `/discover/movie?with_original_language=${code}&sort_by=vote_average.desc`,
        50, `${name}_rating`, mapMovie
      );
      // By vote count (different films surface)
      await fetchEndpoint(
        `/discover/movie?with_original_language=${code}&sort_by=vote_count.desc`,
        50, `${name}_votes`, mapMovie
      );
      // By popularity (catches recent hits)
      await fetchEndpoint(
        `/discover/movie?with_original_language=${code}&sort_by=popularity.desc`,
        30, `${name}_popular`, mapMovie
      );
      // Year-by-year for each Indian language from 1950 onwards
      for (let year = currentYear; year >= 1950; year--) {
        await fetchEndpoint(
          `/discover/movie?with_original_language=${code}&primary_release_year=${year}&sort_by=vote_average.desc`,
          5, `${name}_${year}`, mapMovie
        );
      }
    }

    // ── TV SHOWS ─────────────────────────────────────────────────────────────
    console.log("\n=== TV SHOWS ===\n");

    console.log("[12] Popular TV");
    await fetchEndpoint("/tv/popular", 500, "tv_popular", mapTv);

    console.log("[13] Top-Rated TV");
    await fetchEndpoint("/tv/top_rated", 500, "tv_top_rated", mapTv);

    console.log("[14] On The Air");
    await fetchEndpoint("/tv/on_the_air", 200, "tv_on_air", mapTv);

    console.log("[15] Airing Today");
    await fetchEndpoint("/tv/airing_today", 100, "tv_today", mapTv);

    // Sort by vote_count
    console.log("[16] TV by Vote Count");
    await fetchEndpoint(
      "/discover/tv?sort_by=vote_count.desc",
      500, "tv_vote_count", mapTv
    );

    // Per-genre TV
    const tvGenreIds = Object.keys(tvGenreMap);
    console.log(`\n[17] Per-genre TV by rating (${tvGenreIds.length} genres × 30 pages)`);
    for (const gid of tvGenreIds) {
      await fetchEndpoint(
        `/discover/tv?with_genres=${gid}&sort_by=vote_average.desc`,
        30, tvGenreMap[gid], mapTv
      );
    }

    console.log(`\n[18] Per-genre TV by vote count`);
    for (const gid of tvGenreIds) {
      await fetchEndpoint(
        `/discover/tv?with_genres=${gid}&sort_by=vote_count.desc`,
        20, `${tvGenreMap[gid]}_votes`, mapTv
      );
    }

    // Year-by-year TV sweep
    console.log(`\n[19] TV year-by-year sweep (1950–${currentYear})`);
    for (let year = currentYear; year >= 1950; year--) {
      await fetchEndpoint(
        `/discover/tv?first_air_date_year=${year}&sort_by=vote_average.desc`,
        8, `tv_${year}`, mapTv
      );
    }

    // Per-language TV
    console.log(`\n[20] Per-language TV`);
    for (const lang of LANGUAGES) {
      await fetchEndpoint(
        `/discover/tv?with_original_language=${lang}&sort_by=vote_average.desc`,
        15, `tv_lang:${lang}`, mapTv
      );
    }

    // Indian regional TV — deep sweep
    console.log(`\n[21] Indian regional TV (${INDIAN_LANGUAGES.length} languages)`);
    for (const { code, name } of INDIAN_LANGUAGES) {
      await fetchEndpoint(
        `/discover/tv?with_original_language=${code}&sort_by=vote_average.desc`,
        30, `tv_${name}_rating`, mapTv
      );
      await fetchEndpoint(
        `/discover/tv?with_original_language=${code}&sort_by=vote_count.desc`,
        30, `tv_${name}_votes`, mapTv
      );
      await fetchEndpoint(
        `/discover/tv?with_original_language=${code}&sort_by=popularity.desc`,
        20, `tv_${name}_popular`, mapTv
      );
    }

    console.log(`\n✓ Seeding complete. Grand total upserts: ${grandTotal}`);
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
};

seed();
