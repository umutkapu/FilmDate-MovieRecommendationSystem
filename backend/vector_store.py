import sqlite3
import json
import numpy as np

DB = "movies.db"

def init_db():
    conn = sqlite3.connect(DB)
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS embeddings (
            movie_id INTEGER PRIMARY KEY,
            vector TEXT
        )
    """)
    conn.commit()
    conn.close()

def save_vector(movie_id, vec):
    conn = sqlite3.connect(DB)
    c = conn.cursor()
    c.execute(
        "INSERT OR REPLACE INTO embeddings VALUES (?, ?)",
        (movie_id, json.dumps(vec.tolist()))
    )
    conn.commit()
    conn.close()

def load_vector(movie_id):
    conn = sqlite3.connect(DB)
    c = conn.cursor()
    row = c.execute(
        "SELECT vector FROM embeddings WHERE movie_id = ?",
        (movie_id,)
    ).fetchone()
    conn.close()
    if not row:
        return None
    return np.array(json.loads(row[0]), dtype=np.float32)
