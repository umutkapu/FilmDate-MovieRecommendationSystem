import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import SEO from './components/SEO'

import './css/App.css'
import './css/AppBar.css'
import './css/index.css'

import AppBar from './components/AppBar'
import MovieSelector from './components/MovieSelector'
import Footer from './components/Footer'
import Trending from './pages/Trending'
import MovieDetail from './pages/MovieDetail'
import ActorDetail from './pages/ActorDetail'

const API = import.meta.env.VITE_BACKEND_URL

export default function App() {
  const [search, setSearch] = useState('')
  const [firstPick, setFirstPick] = useState(null)
  const [secondPick, setSecondPick] = useState(null)
  const [recommended, setRecommended] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [recIndex, setRecIndex] = useState(0)
  const [loading, setLoading] = useState(false)

  function handleSearch(q) {
    setSearch(q)
    console.log('Search requested:', q)
  }

  async function handleFindMovie() {
    if (!firstPick || !secondPick) {
      alert('Please select two movies')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(
        `${API}/recommend-ai?movie_a_id=${firstPick.id}&movie_b_id=${secondPick.id}`,
        { method: 'POST' }
      )


      const data = await res.json()

      if (data.error) {
        alert(data.error)
        return
      }

      setRecommendations(data.results)
      setRecIndex(0)
      setRecommended(data.results[0])
    } catch (err) {
      console.error(err)
      alert('Backend error')
    } finally {
      setLoading(false)
    }
  }

  function handleNextMovie() {
    if (!recommendations.length) return
    const nextIndex = (recIndex + 1) % recommendations.length
    setRecIndex(nextIndex)
    setRecommended(recommendations[nextIndex])
  }

  return (
    <>
      <AppBar onSearch={handleSearch} />

      <Routes>
        {/* ---------------- HOME PAGE ---------------- */}
        <Route
          path="/"
          element={
            <>
              <SEO 
                title="FilmDate"
                description="Discover your next favorite movie with AI-powered recommendations. Compare two movies and get personalized film suggestions."
                url="/"
              />
              <main className="app-main" style={{ padding: 24 }}>
                <h1>
                  {search
                    ? `Recommendations for: "${search}"`
                    : 'Choose Your Movies'}
                </h1>

                <p style={{ color: '#666' }}>
                  Use the search bar and select the movie you want to watch.
                </p>

                <section className="pickers">
                  <MovieSelector label="First pick" onSelect={setFirstPick} />

                  <div className="picker-center">
                    <button
                      className="find-btn"
                      onClick={handleFindMovie}
                      disabled={loading}
                    >
                      {loading ? 'Finding…' : 'Find Your Movie'}
                    </button>

                    {loading && (
                      <div
                        className="progress-wrap"
                        role="status"
                        aria-live="polite"
                        aria-busy="true"
                      >
                        <div className="progress">
                          <div className="progress-bar"></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <MovieSelector label="Second pick" onSelect={setSecondPick} />
                </section>

                {recommendations.length > 0 && (
                  <section className="recommendation">
                    <h2>We recommend</h2>

                    <div className="carousel">
                      <div
                        className="carousel-track"
                        style={{
                          transform: `translateX(-${recIndex * 100}%)`
                        }}
                      >
                        {recommendations.map((movie, i) => (
                          <div className="carousel-item" key={i}>
                            <img src={movie.image || movie.poster} alt={movie.title} />
                            <div className="rec-title">{movie.title}</div>

                            {movie.rating && (
                              <div style={{ color: '#ffd700', fontWeight: 600 }}>
                                ⭐ IMDb: {movie.rating.toFixed(1)} / 10
                              </div>
                            )}

                            {movie.overview && (
                              <p className="rec-overview">
                                {movie.overview.length > 220
                                  ? movie.overview.slice(0, 220) + '...'
                                  : movie.overview}
                              </p>
                            )}

                            <a
                              href={`/movie/${recommended.id}`}
                              target='_blank'
                              rel="noopener noreferrer"
                              style={{
                                marginTop: 6,
                                color: '#0ea5a5',
                                fontWeight: 600,
                                textDecoration: 'none'
                              }}
                            >
                              View details →
                            </a>

                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="carousel-controls">
                      <button onClick={handleNextMovie} className="find-btn">
                        Next suggestion →
                      </button>
                    </div>
                  </section>
                )}

              </main>

              <Footer />
            </>
          }
        />

        {/* ---------------- TRENDING PAGE ---------------- */}
        <Route path="/trending" element={<Trending />} />
        {/* ---------------- MOVIE DETAIL PAGE ---------------- */}
        <Route path="/movie/:id" element={<MovieDetail />} />
        {/* ---------------- ACTOR DETAIL PAGE ---------------- */}
        <Route path="/actor/:id" element={<ActorDetail />} />
      </Routes>
    </>
  )
}
