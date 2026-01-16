import os
import requests
from dotenv import load_dotenv

load_dotenv()  # .env dosyasını oku

TMDB_KEY = os.getenv("TMDB_API_KEY")
BASE = "https://api.themoviedb.org/3"

if not TMDB_KEY:
    raise RuntimeError("TMDB_API_KEY bulunamadi! .env dosyasini kontrol et.")


def get_movie(movie_id):
    r = requests.get(
        f"{BASE}/movie/{movie_id}",
        params={
            "api_key": TMDB_KEY,
            "append_to_response": "credits"
        }
    )

    if r.status_code != 200:
        print("TMDB error:", r.text)
        return None

    data = r.json()

    # TMDB error object
    if "status_code" in data:
        print("TMDB response error:", data)
        return None

    return data


def get_similar(movie_id):
    return requests.get(
        f"{BASE}/movie/{movie_id}/similar",
        params={"api_key": TMDB_KEY}
    ).json().get("results", [])
    
def discover_by_genre(genre_ids):
    return requests.get(
        f"{BASE}/discover/movie",
        params={
            "api_key": TMDB_KEY,
            "with_genres": ",".join(map(str, genre_ids)),
            "sort_by": "vote_average.desc",
            "vote_count.gte": 500
        }
    ).json().get("results", [])
    
def get_popular_movies(pages=3):
    movies = []

    for page in range(1, pages + 1):
        r = requests.get(
            f"{BASE}/movie/popular",
            params={
                "api_key": TMDB_KEY,
                "language": "en-US",
                "page": page
            }
        )

        if r.status_code != 200:
            continue

        movies.extend(r.json().get("results", []))

    return movies


