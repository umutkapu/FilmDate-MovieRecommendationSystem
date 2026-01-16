import { useEffect, useState } from 'react'
import Footer from '../components/Footer'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'

const TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY
const IMG = 'https://image.tmdb.org/t/p/w342'

export default function Trending() {
    const [movies, setMovies] = useState([])

    useEffect(() => {
        fetch(
            `https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_KEY}`
        )
            .then(res => res.json())
            .then(data => setMovies(data.results || []))
    }, [])

    return (
        <>
            <SEO 
                title="Trending Movies" 
                description="Discover the most trending movies this week. AI-powered recommendations and latest releases."
                url="/trending"
            />
            <div style={{ padding: 32 }}>
                <h1 style={{ color: 'white', marginBottom: 24 }}>Trending Movies</h1>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                    gap: 20
                }}>
                    {movies.map(m => (
                        <Link to={`/movie/${m.id}`} key={m.id}>
                            <img
                                src={IMG + m.poster_path}
                                alt={m.title}
                                style={{
                                    width: '100%',
                                    borderRadius: 8,
                                    boxShadow: '0 8px 20px rgba(0,0,0,.4)'
                                }}
                            />
                            <div style={{ color: 'white', marginTop: 6 }}>
                                {m.title}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <Footer />
        </>
    )
}
