const https = require("https");

const TMDB_TOKEN = process.env.TMDB_API_KEY;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const tmdbGet = (urlPath) =>
  new Promise((resolve, reject) => {
    const options = {
      hostname: "api.themoviedb.org",
      path: urlPath,
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
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    });
    req.on("error", reject);
    req.setTimeout(10000, () => req.destroy());
    req.end();
  });

const getLangByTmdbId = async (tmdbId, type = "movie") => {
  const endpoint = type === "tv" ? "tv" : "movie";
  const data = await tmdbGet(`/3/${endpoint}/${tmdbId}?language=en-US`);
  return data.original_language || null;
};

const getLangBySearch = async (title, year) => {
  const q = encodeURIComponent(title);
  const yearParam = year ? `&year=${year}` : "";
  const data = await tmdbGet(`/3/search/movie?query=${q}${yearParam}&language=en-US`);
  return data.results?.[0]?.original_language || null;
};

const runBackfill = async () => {
  const Movie = require("../models/Movie");

  const movies = await Movie.find(
    { $or: [{ language: { $exists: false } }, { language: null }] },
    { _id: 1, tmdbId: 1, type: 1, title: 1, releaseYear: 1 }
  ).lean();

  if (movies.length === 0) return;

  console.log(`[backfill] ${movies.length} movies need language — running in background`);

  let done = 0;
  for (const m of movies) {
    try {
      let lang = null;
      if (m.tmdbId) {
        lang = await getLangByTmdbId(m.tmdbId, m.type);
      } else {
        lang = await getLangBySearch(m.title, m.releaseYear);
      }
      await Movie.updateOne({ _id: m._id }, { $set: { language: lang || "en" } });
      done++;
      if (done % 100 === 0) {
        console.log(`[backfill] ${done}/${movies.length} done`);
      }
      await sleep(250);
    } catch {
      await Movie.updateOne({ _id: m._id }, { $set: { language: "en" } }).catch(() => {});
    }
  }

  console.log(`[backfill] complete — ${done} movies updated`);
};

module.exports = { runBackfill };

// Allow running directly: node backfillLanguage.js
if (require.main === module) {
  const mongoose = require("mongoose");
  const dotenv = require("dotenv");
  const path = require("path");
  dotenv.config({ path: path.resolve(__dirname, "../../.env") });
  mongoose.connect(process.env.MONGO_URI)
    .then(() => runBackfill())
    .then(() => process.exit(0))
    .catch((err) => { console.error(err.message); process.exit(1); });
}
