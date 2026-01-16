import { useState, useRef, useEffect } from 'react'
import '../css/MovieSelector.css'

const TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY
const TMDB_SEARCH = 'https://api.themoviedb.org/3/search/movie'
const IMG = 'https://image.tmdb.org/t/p/w342'

export default function MovieSelector({ label = 'Select a movie', onSelect }) {
    const [query, setQuery] = useState('')
    const [open, setOpen] = useState(false)
    const [results, setResults] = useState([])
    const [selected, setSelected] = useState(null)
    const wrapRef = useRef(null)

    useEffect(() => {
        function onDocClick(e) {
            if (!wrapRef.current?.contains(e.target)) setOpen(false)
        }
        document.addEventListener('click', onDocClick)
        return () => document.removeEventListener('click', onDocClick)
    }, [])

    useEffect(() => {
        if (query.length < 2) {
            setResults([])
            return
        }

        if (!TMDB_KEY) {
            console.error("TMDB KEY is missing")
            return
        }

        const t = setTimeout(async () => {
            try {
                const url =
                    `${TMDB_SEARCH}` +
                    `?api_key=${TMDB_KEY}` +
                    `&query=${encodeURIComponent(query)}` +
                    `&include_adult=false` +
                    `&language=en-US` +
                    `&page=1`

                const res = await fetch(url)
                const data = await res.json()

                console.log("TMDB response:", data)

                if (data.success === false) {
                    console.error("TMDB API error:", data.status_message)
                    setResults([])
                    return
                }

                setResults(data.results ?? [])
                setOpen(true)
            } catch (e) {
                console.error("TMDB fetch error:", e)
                setResults([])
            }
        }, 400)

        return () => clearTimeout(t)
    }, [query])


    function pick(m) {
        const movie = {
            id: m.id,
            title: m.title,
            image: m.poster_path ? `${IMG}${m.poster_path}` : null
        }

        setSelected(movie)
        setQuery(movie.title)
        setOpen(false)
        onSelect?.(movie)
    }

    function clear() {
        setSelected(null)
        setQuery('')
        setResults([])
        onSelect?.(null)
    }

    return (
        <div className="movie-selector" ref={wrapRef}>
            {selected && (
                <div className="movie-poster">
                    {selected.image && (
                        <img src={selected.image} alt={`${selected.title} poster`} />
                    )}
                    <div className="movie-title">{selected.title}</div>
                </div>
            )}

            <label className="movie-label">{label}</label>

            <div className="input-wrap">
                <input
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
                    placeholder="Search movies"
                    onFocus={() => setOpen(true)}
                />

                <button className="clear-btn" onClick={clear}>✖</button>

                <ul className={`suggestions ${open ? 'open' : ''}`}>
                    {results.length === 0 && query && (
                        <li className="empty">No results</li>
                    )}

                    {results.map((m) => (
                        <li key={m.id} onClick={() => pick(m)}>
                            {m.title}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}
