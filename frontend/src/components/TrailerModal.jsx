import { useEffect, useState } from 'react'
import { moviesApi } from '../api/movies'

export default function TrailerModal({ movieId, movieTitle, onClose }) {
  const [youtubeKey, setYoutubeKey] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    moviesApi.getTrailer(movieId)
      .then((data) => {
        if (data.youtubeKey) {
          setYoutubeKey(data.youtubeKey)
        } else {
          setError('No trailer available for this movie.')
        }
      })
      .catch(() => setError('Could not load trailer. Please try again.'))
      .finally(() => setLoading(false))
  }, [movieId])

  const handleKey = (e) => { if (e.key === 'Escape') onClose() }

  return (
    <div
      onClick={onClose}
      onKeyDown={handleKey}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.88)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '680px',
          borderRadius: '20px',
          overflow: 'hidden',
          background: '#0a0a0a',
          border: '1px solid rgba(255,75,137,0.2)',
          boxShadow: '0 0 60px rgba(0,0,0,0.8)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid rgba(255,75,137,0.15)',
        }}>
          <div>
            <div style={{
              fontFamily: 'Space Grotesk',
              fontWeight: 700,
              fontStyle: 'italic',
              fontSize: 11,
              letterSpacing: '0.05em',
              background: 'linear-gradient(135deg,#ff4b89,#ff6b9d)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: 2,
            }}>CRITERION</div>
            <div style={{
              fontFamily: 'Space Grotesk',
              fontWeight: 700,
              fontSize: 14,
              color: '#e2e2e2',
              maxWidth: 280,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>{movieTitle}</div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#9a9a9a',
              fontSize: 18,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            aria-label="close"
          >×</button>
        </div>

        {/* 16:9 content area */}
        <div style={{ position: 'relative', paddingTop: '56.25%', background: '#000' }}>
          {loading && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#9a9a9a', fontFamily: 'Space Grotesk', fontSize: 14,
            }}>
              Loading trailer...
            </div>
          )}
          {!loading && error && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#ff4b89', fontFamily: 'Space Grotesk', fontSize: 14,
              padding: '0 24px', textAlign: 'center',
            }}>
              {error}
            </div>
          )}
          {!loading && youtubeKey && (
            <iframe
              src={`https://www.youtube.com/embed/${youtubeKey}?autoplay=1`}
              title={`${movieTitle} trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                position: 'absolute',
                top: 0, left: 0,
                width: '100%',
                height: '100%',
                border: 'none',
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
