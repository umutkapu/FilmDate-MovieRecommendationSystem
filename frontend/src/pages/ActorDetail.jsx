import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Footer from '../components/Footer'
import SEO from '../components/SEO'

const TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY
const IMG = 'https://image.tmdb.org/t/p/w500'

export default function ActorDetail() {
    const { id } = useParams()
    const [actor, setActor] = useState(null)
    const [movies, setMovies] = useState([])

    useEffect(() => {
        fetch(`https://api.themoviedb.org/3/person/${id}?api_key=${TMDB_KEY}`)
            .then(r => r.json())
            .then(setActor)

        fetch(`https://api.themoviedb.org/3/person/${id}/movie_credits?api_key=${TMDB_KEY}`)
            .then(r => r.json())
            .then(d => setMovies(d.cast || []))
    }, [id])

    if (!actor) return <div style={{ color: 'white', padding: 40 }}>Loading…</div>

    const profileUrl = `${IMG}${actor.profile_path}`

    return (
        <>
            <SEO 
                title={actor.name}
                description={actor.biography || `Discover more about ${actor.name}`}
                image={profileUrl}
                url={`/actor/${id}`}
                type="person"
            />
            <div className="actor-detail">
                <div className="actor-header">
                    <img
                        src={`${IMG}${actor.profile_path}`}
                        alt={actor.name}
                        className="actor-photo"
                    />

                    <div>
                        <h1>{actor.name}</h1>
                        <p className="actor-bio">{actor.biography}</p>

                        <p>🎂 Born: {actor.birthday}</p>
                        {actor.deathday && <p>🕊 Died: {actor.deathday}</p>}
                        <p>📍 {actor.place_of_birth}</p>
                    </div>
                </div>

                <h2 style={{ marginTop: 40 }}>Movies</h2>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                        gap: 16
                    }}
                >
                    {movies.slice(0, 16).map(m => (
                        <a
                            href={`/movie/${m.id}`}
                            key={m.id}
                            style={{ textDecoration: 'none', color: 'white' }}
                        >
                            <img
                                src={`https://image.tmdb.org/t/p/w342${m.poster_path}`}
                                alt={m.title}
                                style={{ width: '100%', borderRadius: 10 }}
                            />
                            <div style={{ fontSize: 13, marginTop: 6 }}>{m.title}</div>
                        </a>
                    ))}
                </div>
            </div>
            <Footer />
        </>
    )
}
