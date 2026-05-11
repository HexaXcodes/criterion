import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { moviesApi } from '../api/movies'
import { reviewsApi } from '../api/reviews'
import { usersApi } from '../api/users'
import { useAuth } from '../context/AuthContext'
import GenreBackground from '../components/GenreBackground'
import TopBar from '../components/TopBar'
import BottomNav from '../components/BottomNav'
import MoviePoster from '../components/MoviePoster'
import TrailerModal from '../components/TrailerModal'

export default function FeedPage() {
  const { showToast } = useAuth()
  const navigate = useNavigate()
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [index, setIndex] = useState(0)
  const [liked, setLiked] = useState(new Set())
  const [saved, setSaved] = useState(new Set())
  const [showTrailer, setShowTrailer] = useState(false)
  const touchStartY = useRef(null)
  const isSwiping = useRef(false)
  const seenIdsRef = useRef([])

  useEffect(() => {
    moviesApi
      .getRecommendationsExplained()
      .then((data) => {
        setMovies(data.recommendations || [])
      })
      .catch(() => {
        // Fallback to plain recommendations
        moviesApi
          .getRecommendations()
          .then((data) => setMovies(data.recommendations || []))
          .catch(() => showToast('Could not load feed', 'error'))
      })
      .finally(() => setLoading(false))
  }, [showToast])

  const [refreshing, setRefreshing] = useState(false)

  const movie = movies[index]
  const movieId = movie?._id || movie?.id

  const refresh = () => {
    setRefreshing(true)
    setMovies([])
    setIndex(0)
    const exclude = seenIdsRef.current.slice(-50)
    moviesApi
      .getRecommendationsExplained(exclude)
      .then((data) => setMovies(data.recommendations || []))
      .catch(() =>
        moviesApi.getRecommendations().then((data) => setMovies(data.recommendations || []))
      )
      .finally(() => setRefreshing(false))
  }

  const next = () => {
    if (index >= movies.length - 1) {
      refresh()
    } else {
      setIndex((i) => i + 1)
    }
  }
  const prev = () => setIndex((i) => Math.max(i - 1, 0))

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY
    isSwiping.current = false
  }
  const handleTouchEnd = (e) => {
    if (touchStartY.current == null) return
    const dy = e.changedTouches[0].clientY - touchStartY.current
    if (dy < -40) {
      isSwiping.current = true
      next()
    } else if (dy > 40) {
      isSwiping.current = true
      prev()
    }
    touchStartY.current = null
  }

  const markSeen = (id) => {
    if (id && !seenIdsRef.current.includes(id)) {
      seenIdsRef.current = [...seenIdsRef.current, id]
    }
  }

  const handleLike = async () => {
    if (!movie || liked.has(movieId)) return
    markSeen(movieId)
    try {
      await reviewsApi.add({ movieId, rating: 5, comment: 'Loved it' })
      setLiked((s) => new Set([...s, movieId]))
      showToast('Liked', 'success', 1800)
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not like', 'error')
    } finally {
      next()
    }
  }

  const handleDismiss = () => {
    markSeen(movieId)
    next()
  }

  const handleSave = async () => {
    if (!movie || saved.has(movieId)) return
    try {
      await usersApi.addToWatchlist(movieId)
      setSaved((s) => new Set([...s, movieId]))
      showToast('Added to watchlist', 'success', 1800)
    } catch (err) {
      showToast(err.response?.data?.message || 'Already in watchlist', 'info')
    }
  }

  const handleShare = async () => {
    if (!movie) return
    if (navigator.share) {
      try {
        await navigator.share({
          title: movie.title,
          text: movie.explanation || `Check out ${movie.title} on Criterion`,
        })
      } catch {}
    } else {
      navigator.clipboard?.writeText(`${movie.title} — ${window.location.origin}/movie/${movieId}`)
      showToast('Link copied', 'success', 1800)
    }
  }

  return (
    <div className="min-h-screen relative">
      <GenreBackground genre={movie?.genre?.[0]} />

      <TopBar />

      {loading || refreshing ? (
        <FeedSkeleton />
      ) : !movie ? (
        <EmptyFeed />
      ) : (
        <main
          className="z-content relative pb-28"
          style={{ minHeight: 'calc(100vh - 60px)' }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Full-bleed poster */}
          <div
            className="relative cursor-pointer animate-fade-in"
            style={{ minHeight: 'calc(100vh - 140px)' }}
            onClick={() => {
              if (isSwiping.current) { isSwiping.current = false; return }
              navigate(`/movie/${movieId}`)
            }}
          >
            <MoviePoster
              posterUrl={movie.posterUrl}
              title={movie.title}
              size="original"
              className="absolute inset-0 w-full h-full"
            />
            {/* Gradient overlay */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 30%, rgba(10,10,10,0.85) 75%, #0a0a0a 100%)',
              }}
            />

            {/* Star rating top right */}
            {movie.averageRating ? (
              <div className="absolute top-4 right-4 chip-pink flex items-center gap-1 backdrop-blur-md">
                <span>★</span>
                <span className="font-bold">{Number(movie.averageRating).toFixed(1)}</span>
              </div>
            ) : null}

            {/* Bottom info */}
            <div className="absolute bottom-0 left-0 right-0 p-5 pr-20">
              {movie.genre?.[0] && (
                <span className="chip-genre inline-block mb-3">{movie.genre[0]}</span>
              )}
              <h1
                className="text-4xl font-bold text-white mb-2 leading-tight uppercase"
                style={{ fontFamily: 'Space Grotesk', letterSpacing: '0.02em' }}
              >
                {movie.title}
              </h1>
              {movie.explanation && (
                <p className="text-text-primary text-sm leading-relaxed line-clamp-3">
                  <span className="text-pink-neon font-semibold">AI Insight: </span>
                  {movie.explanation}
                </p>
              )}
              {!movie.explanation && movie.description && (
                <p className="text-text-secondary text-sm leading-relaxed line-clamp-3">
                  {movie.description}
                </p>
              )}
            </div>

            {/* Side action rail */}
            <div className="absolute right-4 bottom-32 flex flex-col gap-4">
              <ActionButton
                onClick={(e) => {
                  e.stopPropagation()
                  handleDismiss()
                }}
              >
                <DismissIcon />
                <span className="text-[10px] mt-1 text-white/80">Skip</span>
              </ActionButton>
              <ActionButton
                onClick={(e) => {
                  e.stopPropagation()
                  handleLike()
                }}
                active={liked.has(movieId)}
              >
                <HeartIcon filled={liked.has(movieId)} />
                <span className="text-[10px] mt-1 text-white/80">Like</span>
              </ActionButton>
              <ActionButton
                onClick={(e) => {
                  e.stopPropagation()
                  handleSave()
                }}
                active={saved.has(movieId)}
              >
                <BookmarkIcon filled={saved.has(movieId)} />
                <span className="text-[10px] mt-1 text-white/80">Save</span>
              </ActionButton>
              <ActionButton
                onClick={(e) => {
                  e.stopPropagation()
                  handleShare()
                }}
              >
                <ShareIcon />
                <span className="text-[10px] mt-1 text-white/80">Share</span>
              </ActionButton>
              <ActionButton
                onClick={(e) => {
                  e.stopPropagation()
                  setShowTrailer(true)
                }}
              >
                <PlayIcon />
                <span className="text-[10px] mt-1 text-white/80">Trailer</span>
              </ActionButton>
            </div>
          </div>

          {/* Counter / nav hints */}
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 text-text-muted text-xs tracking-widest uppercase">
            {index + 1} / {movies.length} • swipe up
          </div>
        </main>
      )}

      <BottomNav />

      {showTrailer && movie && (
        <TrailerModal
          movieId={movie.id || movie._id}
          movieTitle={movie.title}
          onClose={() => setShowTrailer(false)}
        />
      )}
    </div>
  )
}

function PlayIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <polygon points="10,8 16,12 10,16" fill="white" stroke="none" />
    </svg>
  )
}

function ActionButton({ children, onClick, active }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center w-14 h-14 rounded-full transition active:scale-95"
      style={{
        background: active ? 'rgba(255, 75, 137, 0.2)' : 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(16px)',
        border: active ? '1px solid #ff4b89' : '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {children}
    </button>
  )
}

function DismissIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
      <path d="M18 6L6 18M6 6L18 18" />
    </svg>
  )
}

function HeartIcon({ filled }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? '#ff4b89' : 'none'} stroke={filled ? '#ff4b89' : 'white'} strokeWidth="2">
      <path d="M12 21S4 13.5 4 8.5C4 5.5 6 3 9 3C10.5 3 12 4 12 4C12 4 13.5 3 15 3C18 3 20 5.5 20 8.5C20 13.5 12 21 12 21Z" />
    </svg>
  )
}

function BookmarkIcon({ filled }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? '#ff4b89' : 'none'} stroke={filled ? '#ff4b89' : 'white'} strokeWidth="2">
      <path d="M5 4C5 3.45 5.45 3 6 3H18C18.55 3 19 3.45 19 4V21L12 17L5 21V4Z" />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  )
}

function FeedSkeleton() {
  return (
    <div className="z-content relative px-4 pt-4 pb-28">
      <div className="skeleton w-full" style={{ height: 'calc(100vh - 200px)', borderRadius: 24 }} />
    </div>
  )
}

function EmptyFeed() {
  const navigate = useNavigate()
  return (
    <div className="z-content relative flex flex-col items-center justify-center text-center px-6" style={{ minHeight: 'calc(100vh - 140px)' }}>
      <div className="text-5xl mb-4">🎬</div>
      <h2 className="display-glow text-2xl mb-2">No recommendations yet</h2>
      <p className="text-text-secondary mb-6">Set your genre preferences to get started</p>
      <button onClick={() => navigate('/profile')} className="btn-primary">
        Set Preferences
      </button>
    </div>
  )
}
