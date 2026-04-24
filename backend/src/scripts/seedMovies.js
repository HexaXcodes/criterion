const mongoose = require("mongoose");
const dotenv = require("dotenv");
const https = require("https");

dotenv.config({ path: "../../.env" });

const Movie = require("../models/Movie");

const TMDB_TOKEN = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

// Genre ID to name mapping from TMDB
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
  37: "Western"
};

const fetchPage = (page, retries = 3) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.themoviedb.org",
      path: `/3/movie/popular?language=en-US&page=${page}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${TMDB_TOKEN}`,
        accept: "application/json"
      }
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
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
        console.log(`Page ${page} failed, retrying... (${retries} left)`);
        await new Promise(r => setTimeout(r, 2000));
        resolve(fetchPage(page, retries - 1));
      } else {
        reject(err);
      }
    });

    req.setTimeout(10000, () => {
      req.destroy();
    });

    req.end();
  });
};

const seedMovies = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    let totalSaved = 0;

    for (let page = 1; page <= 50; page++) {
      const data = await fetchPage(page);

      if (!data.results) {
        console.log("No results on page", page);
        break;
      }

      const movies = data.results.map(m => ({
        title: m.title,
        description: m.overview,
        genre: m.genre_ids.map(id => genreMap[id]).filter(Boolean),
        releaseYear: m.release_date ? parseInt(m.release_date.split("-")[0]) : null,
        posterUrl: m.poster_path
          ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
          : "",
        averageRating: parseFloat((m.vote_average / 2).toFixed(1)),
        tmdbId: m.id
      }));

      for (const movie of movies) {
        await Movie.updateOne(
          { tmdbId: movie.tmdbId },
          { $set: movie },
          { upsert: true }
        );
      }

      totalSaved += movies.length;
      console.log(`Page ${page}/50 done — ${totalSaved} movies saved`);

      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 250));
    }

    console.log(`Seeding complete. Total: ${totalSaved} movies`);
    process.exit(0);

  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

seedMovies();