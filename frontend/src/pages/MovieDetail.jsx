import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Footer from '../components/Footer'
import SEO from '../components/SEO'

const TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY
const IMG = 'https://image.tmdb.org/t/p/w500'
const PROFILE = 'https://image.tmdb.org/t/p/w185'

export default function MovieDetail() {
    const { id } = useParams()
    const [movie, setMovie] = useState(null)
    const [video, setVideo] = useState(null)

    useEffect(() => {
        fetch(
            `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_KEY}&append_to_response=videos,credits`
        )
            .then(r => r.json())
            .then(data => {
                setMovie(data)
                const trailer = data.videos?.results?.find(v => v.type === 'Trailer')
                setVideo(trailer)
            })
    }, [id])

    if (!movie) return <div style={{ color: 'white', padding: 40 }}>Loading…</div>

    const posterUrl = IMG + movie.poster_path

    return (
        <>
            <SEO 
                title={movie.title}
                description={movie.overview || 'Watch this movie on FilmDate'}
                image={posterUrl}
                url={`/movie/${id}`}
                type="movie"
            />
            <div style={{ padding: 32, color: 'white', maxWidth: 1100, margin: '0 auto' }}>
                {/* MAIN INFO */}
                <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
                    <img
                        src={IMG + movie.poster_path}
                        alt={movie.title}
                        style={{ width: 300, borderRadius: 12 }}
                    />

                    <div style={{ flex: 1 }}>
                        <h1>{movie.title}</h1>
                        <p style={{ color: '#aaa' }}>{movie.overview}</p>

                        <p>⭐ IMDb: {movie.vote_average.toFixed(1)} / 10</p>

                        <p>
                            Genres: {movie.genres.map(g => g.name).join(', ')}
                        </p>

                    </div>
                </div>

                {/* CAST */}
                <h2 style={{ marginTop: 40 }}>Cast</h2>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                        gap: 18,
                        marginTop: 12
                    }}
                >
                    {movie.credits.cast.slice(0, 12).map(actor => (
                        <Link
                            to={`/actor/${actor.id}`}
                            key={actor.id}
                            style={{
                                textAlign: 'center',
                                textDecoration: 'none',
                                color: 'inherit'
                            }}
                        >
                            <img
                                src={
                                    actor.profile_path
                                        ? PROFILE + actor.profile_path
                                        : 'https://via.placeholder.com/185x278?text=No+Photo'
                                }
                                alt={actor.name}
                                style={{
                                    width: '100%',
                                    borderRadius: 10,
                                    boxShadow: '0 6px 18px rgba(0,0,0,.5)',
                                    transition: 'transform .2s ease, box-shadow .2s ease'
                                }}
                            />

                            <div style={{ marginTop: 6, fontWeight: 600 }}>
                                {actor.name}
                            </div>

                            <div style={{ fontSize: 12, color: '#aaa' }}>
                                {actor.character}
                            </div>
                        </Link>
                    ))}
                </div>

                {/* TRAILER */}
                {video && (
                    <div style={{ marginTop: 50 }}>
                        <h2>Trailer</h2>
                        <iframe
                            width="100%"
                            height="420"
                            src={`https://www.youtube.com/embed/${video.key}`}
                            allowFullScreen
                        />
                    </div>
                )}
            </div>
            <Footer />
        </>
    )
}
