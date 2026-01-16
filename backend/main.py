from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from threading import Lock

from tmdb import (
    get_movie,
    get_similar,
    discover_by_genre,
    get_popular_movies
)
from recommender import score
from embeddings import embed_movie
from vector_store import init_db, save_vector, load_vector


# =========================
# INIT
# =========================

init_db()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://filmdatemovies.com",
        "https://www.filmdatemovies.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

movie_vectors = None
movie_meta = None
load_lock = Lock()


# =========================
# LAZY + CACHED LOADER
# =========================

def load_embeddings():
    global movie_vectors, movie_meta

    if movie_vectors is not None:
        return

    with load_lock:
        if movie_vectors is not None:
            return

        print("Loading AI movie embeddings (cached)...")

        popular_movies = get_popular_movies(pages=3)
        vectors = []
        meta = []

        for m in popular_movies:
            full = get_movie(m["id"])
            if not full or not full.get("overview") or not full.get("credits"):
                continue

            vec = load_vector(full["id"])

            if vec is None:
                vec = embed_movie(full)
                save_vector(full["id"], vec)

            vectors.append(vec)
            meta.append(full)

        movie_vectors = np.array(vectors)
        movie_meta = meta

        print(f"Loaded {len(movie_vectors)} movie embeddings.")


# =========================
# CLASSIC RECOMMENDER
# =========================

@app.post("/recommend")
def recommend(movie_a_id: int, movie_b_id: int):
    a = get_movie(movie_a_id)
    b = get_movie(movie_b_id)

    if not a or not b:
        return {"error": "Invalid movie selection"}

    pool = get_similar(movie_a_id) + get_similar(movie_b_id)

    if not pool:
        genre_ids = list(
            {g["id"] for g in a.get("genres", [])} |
            {g["id"] for g in b.get("genres", [])}
        )
        pool = discover_by_genre(genre_ids)

    scored = []
    for p in pool[:30]:
        full = get_movie(p["id"])
        if not full or not full.get("genres") or not full.get("credits"):
            continue

        s = score(full, a, b)
        scored.append((s, full))

    scored.sort(key=lambda x: x[0], reverse=True)
    top = [m for _, m in scored[:5]]

    return {
        "results": [
            {
                "id": m["id"],
                "title": m["title"],
                "poster": f"https://image.tmdb.org/t/p/w500{m['poster_path']}",
                "rating": m["vote_average"],
                "genres": [g["name"] for g in m["genres"]],
            }
            for m in top
        ]
    }


# =========================
# AI HELPERS
# =========================

def cosine_sim(a, b):
    return float(np.dot(a, b))


def hybrid_score(similarity, movie, a, b):
    genre_ids_a = {g["id"] for g in a.get("genres", [])}
    genre_ids_b = {g["id"] for g in b.get("genres", [])}
    genre_ids_m = {g["id"] for g in movie.get("genres", [])}

    genre_overlap = len(genre_ids_m & (genre_ids_a | genre_ids_b))
    genre_score = genre_overlap / max(len(genre_ids_m), 1)

    rating_score = movie.get("vote_average", 0) / 10

    return (
        0.65 * similarity +
        0.20 * genre_score +
        0.15 * rating_score
    )


# =========================
# AI RECOMMENDER
# =========================

@app.post("/recommend-ai")
def recommend_ai(movie_a_id: int, movie_b_id: int):
    load_embeddings()   # 🔥 now cached

    a = get_movie(movie_a_id)
    b = get_movie(movie_b_id)

    if not a or not b:
        return {"error": "Invalid movie selection"}

    vec_a = embed_movie(a)
    vec_b = embed_movie(b)
    user_vec = 0.6 * vec_a + 0.4 * vec_b

    scores = []
    for i, vec in enumerate(movie_vectors):
        sim = cosine_sim(vec, user_vec)
        s = hybrid_score(sim, movie_meta[i], a, b)
        scores.append(s)

    excluded = {movie_a_id, movie_b_id}
    ranked = [
        i for i in np.argsort(scores)[::-1]
        if movie_meta[i]["id"] not in excluded
    ]

    selected = []
    for idx in ranked:
        if not selected:
            selected.append(idx)
            continue

        if all(cosine_sim(movie_vectors[idx], movie_vectors[s]) < 0.92 for s in selected):
            selected.append(idx)

        if len(selected) == 5:
            break

    return {
        "results": [
            {
                "id": movie_meta[i]["id"],
                "title": movie_meta[i]["title"],
                "poster": f"https://image.tmdb.org/t/p/w500{movie_meta[i]['poster_path']}",
                "rating": movie_meta[i]["vote_average"],
                "overview": movie_meta[i]["overview"],
                "imdb_url": (
                    f"https://www.imdb.com/title/{movie_meta[i]['imdb_id']}/"
                    if movie_meta[i].get("imdb_id") else None
                ),
                "similarity": float(cosine_sim(movie_vectors[i], user_vec)),
            }
            for i in selected
        ]
    }
