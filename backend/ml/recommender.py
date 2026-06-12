from flask import Flask, request, jsonify
from pymongo import MongoClient
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import os
from dotenv import load_dotenv

load_dotenv("../.env")

app = Flask(__name__)

# Connect to MongoDB
client = MongoClient(os.getenv("MONGO_URI"))
db = client["movierevDB"]

def load_movies():
    movies = list(db.movies.find({}, {
        "_id": 1,
        "title": 1,
        "genre": 1,
        "description": 1,
        "averageRating": 1,
        "posterUrl": 1,
        "language": 1
    }))
    return movies

def build_feature_string(movie):
    genres = " ".join(movie.get("genre", []))
    description = movie.get("description", "")
    language = movie.get("language", "") or ""
    # Repeat genres 3x and language 2x to give them more weight
    return f"{genres} {genres} {genres} {language} {language} {description}"

@app.route("/recommend", methods=["POST"])
def recommend():
    try:
        data = request.json
        preferred_genres = data.get("genres", [])
        watched_ids = data.get("watchedIds", [])
        excluded_ids = data.get("excludeIds", watched_ids)
        liked_genres = data.get("likedGenres", [])  # genres from highly rated reviews
        watchlist_genres = data.get("watchlistGenres", [])
        taste_texts = data.get("tasteTexts", [])
        preferred_languages = data.get("languages", ["en"])

        movies = load_movies()

        if not movies:
            return jsonify({"error": "No movies found"}), 404

        # Strict language filter — never silently fall back to unfiltered
        allowed_languages = set(preferred_languages or [])
        if "en" in allowed_languages:
            allowed_languages.update(["", None])
        if allowed_languages:
            movies = [
                m for m in movies
                if m.get("language") in allowed_languages
            ]

        if not movies:
            return jsonify({"recommendations": []}), 200

        # Build feature strings for all movies
        features = [build_feature_string(m) for m in movies]

        # Build user profile with weighted elements to prioritize actual user activity
        weighted_preferred = preferred_genres * 2
        weighted_liked = liked_genres * 10
        weighted_watchlist = watchlist_genres * 8
        
        all_preferred = weighted_preferred + weighted_liked + weighted_watchlist
        lang_tokens = (preferred_languages or []) * 2
        
        # Include preferred languages in user profile for TF-IDF matching
        user_profile = " ".join(all_preferred + lang_tokens + (taste_texts * 3))

        if not user_profile.strip():
            user_profile = "popular movie"

        all_features = features + [user_profile]

        # TF-IDF vectorization
        vectorizer = TfidfVectorizer(stop_words="english")
        tfidf_matrix = vectorizer.fit_transform(all_features)

        # Cosine similarity
        user_vector = tfidf_matrix[-1]
        movie_vectors = tfidf_matrix[:-1]
        similarities = cosine_similarity(user_vector, movie_vectors)[0]

        excluded_set = set(excluded_ids)
        recommendations = []

        for idx in range(len(movies)):
            movie = movies[idx]
            movie_id = str(movie["_id"])

            if movie_id in excluded_set:
                continue

            similarity = float(similarities[idx])
            rating = float(movie.get("averageRating") or 0)

            # Same-language boost: 15% bonus when movie language matches preference
            movie_lang = movie.get("language") or ""
            lang_boost = 0.15 if movie_lang in (preferred_languages or []) else 0.0

            # Combined score — 80% similarity + 5% rating quality + 15% language match
            combined_score = (similarity * 0.8) + ((rating / 5) * 0.05) + lang_boost

            recommendations.append({
                "id": movie_id,
                "title": movie.get("title"),
                "genre": movie.get("genre"),
                "averageRating": rating,
                "posterUrl": movie.get("posterUrl"),
                "description": movie.get("description"),
                "language": movie.get("language"),
                "similarityScore": round(similarity, 3),
                "combinedScore": round(combined_score, 3)
            })

        # Sort by combined score
        recommendations.sort(key=lambda x: x["combinedScore"], reverse=True)

        return jsonify({"recommendations": recommendations[:10]})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ML service running"})

if __name__ == "__main__":
    print("Starting ML recommendation service...")
    app.run(port=5001, debug=True)
