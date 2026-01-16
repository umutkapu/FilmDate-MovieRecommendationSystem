import { useState, useEffect, useRef } from 'react'
import '../css/AppBar.css'
import logo from '../assets/website_logo.png'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'


const TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY
const SEARCH_URL = 'https://api.themoviedb.org/3/search/movie'

export default function AppBar() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [open, setOpen] = useState(false)
    const wrapRef = useRef(null)
    const navigate = useNavigate()


    useEffect(() => {
        function onClick(e) {
            if (!wrapRef.current?.contains(e.target)) {
                setOpen(false)
            }
        }
        document.addEventListener('click', onClick)
        return () => document.removeEventListener('click', onClick)
    }, [])

    useEffect(() => {
        if (query.length < 2) {
            setResults([])
            return
        }

        const t = setTimeout(async () => {
            const res = await fetch(
                `${SEARCH_URL}?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}`
            )
            const data = await res.json()
            setResults(data.results || [])
            setOpen(true)
        }, 300)

        return () => clearTimeout(t)
    }, [query])

    function openMovie(movieId) {
        navigate(`/movie/${movieId}`)
        setOpen(false)
        setQuery('')
    }


    return (
        <header className="appbar">
            <div className="appbar-left">
                <Link to="/" className="home-link" aria-label="Go to home">
                    <img src={logo} alt="FilmDate Logo" className="logo" />
                    <div className="title">FilmDate</div>
                </Link>
            </div>

            <div className="appbar-center">
                <Link to="/trending" className="nav-link">
                    Trending Movies
                </Link>
            </div>


            <div className="appbar-search" ref={wrapRef}>
                <input
                    placeholder="View movie details…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query && setOpen(true)}
                />

                {open && (
                    <ul className="appbar-results">
                        {results.length === 0 && (
                            <li className="empty">No results</li>
                        )}

                        {results.map(m => (
                            <li key={m.id} onClick={() => openMovie(m.id)}>
                                {m.title} {m.release_date ? `(${m.release_date.slice(0, 4)})` : ''}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </header>
    )
}
