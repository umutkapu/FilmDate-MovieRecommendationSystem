def score(candidate, a, b):
    score = 0

    genres_c = {g["id"] for g in candidate["genres"]}
    genres_a = {g["id"] for g in a["genres"]}
    genres_b = {g["id"] for g in b["genres"]}

    score += 3 * len(genres_c & genres_a)
    score += 3 * len(genres_c & genres_b)

    cast_c = {c["id"] for c in candidate["credits"]["cast"][:5]}
    cast_a = {c["id"] for c in a["credits"]["cast"][:5]}
    cast_b = {c["id"] for c in b["credits"]["cast"][:5]}

    score += 2 * len(cast_c & cast_a)
    score += 2 * len(cast_c & cast_b)

    score += max(0, 1 - abs(candidate["vote_average"] - (a["vote_average"] + b["vote_average"]) / 2) / 10)

    return score
