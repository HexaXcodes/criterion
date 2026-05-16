import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { moviesApi } from '../api/movies'
import { reviewsApi } from '../api/reviews'
import { usersApi } from '../api/users'
import { useAuth } from '../context/AuthContext'
import GenreBackground from '../components/GenreBackground'
import MoviePoster from '../components/MoviePoster'
import StarRating from '../components/StarRating'
import BottomNav from '../components/BottomNav'
import TrailerModal from '../components/TrailerModal'
import { timeAgo } from '../utils/helpers'

export default function MovieDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, showToast, showAuthGate } = useAuth()

  const [movie, setMovie] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  // Add review form
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showTrailer, setShowTrailer] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      moviesApi.getById(id).then(setMovie).catch(() => null),
      reviewsApi.getByMovie(id).then(setReviews).catch(() => []),
    ]).finally(() => setLoading(false))
  }, [id])

  const handleAddToWatchlist = async () => {
    if (!isAuthenticated) {
      showAuthGate('add films to your watchlist')
      return
    }
    try {
      await usersApi.addToWatchlist(id)
      showToast('Added to watchlist', 'success')
    } catch (err) {
      showToast(err.response?.data?.message || 'Already in watchlist', 'info')
    }
  }

  const handleMarkWatched = async () => {
    if (!isAuthenticated) {
      showAuthGate('track films you\'ve watched')
      return
    }
    try {
      await usersApi.markWatched(id)
      showToast('Marked as watched', 'success')
    } catch (err) {
      showToast(err.response?.data?.message || 'Already watched', 'info')
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      showAuthGate('leave a review')
      return
    }
    if (!rating) {
      showToast('Please pick a rating', 'error')
      return
    }
    setSubmitting(true)
    try {
      const result = await reviewsApi.add({ movieId: id, rating, comment })
      setReviews((r) => [result.review, ...r])
      setRating(0)
      setComment('')
      showToast('Review added', 'success')
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not add review', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <div className="skeleton w-full h-[55vh]" />
        <div className="px-5 pt-5 space-y-3">
          <div className="skeleton h-8 w-2/3" />
          <div className="skeleton h-4 w-1/2" />
          <div className="skeleton h-20 w-full" />
        </div>
        <BottomNav />
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-deep">
        <div className="text-center">
          <p className="text-text-secondary mb-4">Movie not found</p>
          <button onClick={() => navigate(-1)} className="btn-primary">
            Go back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative pb-28">
      <GenreBackground genre={movie.genre?.[0]} />

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="z-modal fixed top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(16px)' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <path d="M15 18L9 12L15 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Full bleed poster */}
      <div className="relative" style={{ height: '72vh', minHeight: 380 }}>
        <MoviePoster
          posterUrl={movie.posterUrl}
          title={movie.title}
          size="original"
          className="absolute inset-0 w-full h-full"
          style={{ objectFit: 'cover', objectPosition: 'center top' }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 35%, rgba(10,10,10,0.7) 75%, #0a0a0a 100%)',
          }}
        />
      </div>

      <div className="z-content relative px-5 -mt-12">
        {/* Title block */}
        <div className="mb-5">
          {movie.genre?.[0] && <span className="chip-genre inline-block mb-3">{movie.genre[0]}</span>}
          <h1
            className="display-glow text-4xl mb-3 leading-tight uppercase"
            style={{ letterSpacing: '0.02em' }}
          >
            {movie.title}
          </h1>
          <div className="flex items-center gap-3 text-sm">
            {movie.averageRating ? (
              <>
                <StarRating rating={movie.averageRating} size={16} color="#ff4b89" />
                <span className="text-pink-neon font-bold">
                  {Number(movie.averageRating).toFixed(1)}
                </span>
              </>
            ) : (
              <span className="text-text-muted">No ratings yet</span>
            )}
            {movie.releaseYear && (
              <>
                <span className="text-text-muted">•</span>
                <span className="text-text-muted">{movie.releaseYear}</span>
              </>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mb-6">
          <button onClick={handleAddToWatchlist} className="btn-secondary flex-1 text-xs">
            + Watchlist
          </button>
          <button onClick={handleMarkWatched} className="btn-secondary flex-1 text-xs">
            ✓ Watched
          </button>
          <button
            onClick={() => setShowTrailer(true)}
            className="flex-1 text-xs flex items-center justify-center gap-1 rounded-2xl font-semibold transition active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #ff4b89, #ff6b9d)',
              color: '#0a0a0a',
              padding: '12px 0',
            }}
          >
            ▶ Trailer
          </button>
        </div>

        {/* Description */}
        {movie.description && (
          <div className="glass rounded-2xl p-5 mb-6">
            <p className="text-text-primary text-sm leading-relaxed">{movie.description}</p>
          </div>
        )}

        {/* Reviews section */}
        <div className="mb-5">
          <h2 className="display-glow text-2xl mb-3">Reviews ({reviews.length})</h2>

          {/* Add review form */}
          {isAuthenticated && (
            <form onSubmit={handleSubmitReview} className="glass rounded-2xl p-4 mb-4">
              <p className="text-xs font-semibold text-text-secondary tracking-widest uppercase mb-3">
                Your rating
              </p>
              <div className="mb-3">
                <StarRating rating={rating} size={28} interactive onChange={setRating} color="#ff4b89" />
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts..."
                rows={3}
                className="input-glass mb-3 resize-none"
              />
              <button type="submit" disabled={submitting} className="btn-primary w-full text-sm disabled:opacity-50">
                {submitting ? 'Posting...' : 'Post Review'}
              </button>
            </form>
          )}

          {/* Reviews list */}
          <div className="space-y-3">
            {reviews.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-8">
                No reviews yet. Be the first.
              </p>
            ) : (
              reviews.map((r) => (
                <div key={r._id} className="glass rounded-2xl p-4 animate-slide-up">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-bold text-text-primary text-sm" style={{ fontFamily: 'Space Grotesk' }}>
                      {r.user?.name || 'Anonymous'}
                    </div>
                    <span className="text-text-muted text-xs">{timeAgo(r.createdAt)}</span>
                  </div>
                  <div className="mb-2">
                    <StarRating rating={r.rating} size={12} color="#ff4b89" />
                  </div>
                  {r.comment && <p className="text-text-secondary text-sm">{r.comment}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <BottomNav />

      {showTrailer && (
        <TrailerModal
          movieId={id}
          movieTitle={movie.title}
          onClose={() => setShowTrailer(false)}
        />
      )}
    </div>
  )
}
