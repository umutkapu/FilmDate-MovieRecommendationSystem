import requests
import os
import numpy as np
import time

HF_TOKEN = os.getenv("HF_TOKEN")

HF_URL = "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction"


HEADERS = {
    "Authorization": f"Bearer {HF_TOKEN}",
    "Content-Type": "application/json"
}

def movie_to_text(movie):
    title = movie.get("title", "")
    overview = movie.get("overview", "")

    genres = " ".join([g["name"] for g in movie.get("genres", [])])
    cast = " ".join(
        [c["name"] for c in movie.get("credits", {}).get("cast", [])[:5]]
    )
    director = next(
        (c["name"] for c in movie.get("credits", {}).get("crew", [])
         if c["job"] == "Director"),
        ""
    )
    year = movie.get("release_date", "")[:4]

    return f"""
Title: {title}
Year: {year}
Genres: {genres}
Director: {director}
Cast: {cast}
Overview: {overview}
"""


def embed_movie(movie):
    text = movie_to_text(movie)

    payload = {
        "inputs": [text]
    }

    for _ in range(3):
        response = requests.post(HF_URL, headers=HEADERS, json=payload)
        if response.status_code == 200:
            break
        time.sleep(2)

    if response.status_code != 200:
        raise Exception(f"HuggingFace error: {response.text}")

    data = response.json()

    # output: [[embedding]]
    embedding = data[0]

    vec = np.array(embedding, dtype=np.float32)
    vec = vec / np.linalg.norm(vec)

    return vec
