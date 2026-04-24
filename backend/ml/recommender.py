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
        "posterUrl": 1
    }))
    return movies

def build_feature_string(movie):
    genres = " ".join(movie.get("genre", []))
    description = movie.get("description", "")
    # Repeat genres 3x to give them more weight
    return f"{genres} {genres} {genres} {description}"

@app.route("/recommend", methods=["POST"])
def recommend():
    try:
        data = request.json
        preferred_genres = data.get("genres", [])
        watched_ids = data.get("watchedIds", [])
        liked_genres = data.get("likedGenres", [])  # genres from highly rated reviews

        movies = load_movies()

        if not movies:
            return jsonify({"error": "No movies found"}), 404

        # Build feature strings for all movies
        features = [build_feature_string(m) for m in movies]

        # Build user profile — preference genres + liked genres from reviews
        all_preferred = preferred_genres + liked_genres
        user_profile = " ".join(all_preferred * 3)

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

        watched_set = set(watched_ids)
        recommendations = []

        for idx in range(len(movies)):
            movie = movies[idx]
            movie_id = str(movie["_id"])

            if movie_id in watched_set:
                continue

            similarity = float(similarities[idx])
            rating = float(movie.get("averageRating") or 0)

            # Combined score — 70% similarity + 30% rating quality
            combined_score = (similarity * 0.7) + ((rating / 5) * 0.3)

            recommendations.append({
                "id": movie_id,
                "title": movie.get("title"),
                "genre": movie.get("genre"),
                "averageRating": rating,
                "posterUrl": movie.get("posterUrl"),
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