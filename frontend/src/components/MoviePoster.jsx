import { useState } from 'react'

function resolveTmdbUrl(url, size) {
  if (!url || !size) return url
  const path = url.startsWith('/') ? url : null
  if (path) return `https://image.tmdb.org/t/p/${size}${path}`

  // TMDB URLs look like: https://image.tmdb.org/t/p/w500/abc.jpg
  return url.replace(/\/t\/p\/(?:w\d+|original)\//, `/t/p/${size}/`)
}

function buildSrcSet(url) {
  if (!url || (!url.startsWith('/') && !url.includes('image.tmdb.org/t/p/'))) return undefined

  return [
    ['w780', 780],
    ['w1280', 1280],
    ['original', 1600],
  ]
    .map(([size, width]) => `${resolveTmdbUrl(url, size)} ${width}w`)
    .join(', ')
}

export default function MoviePoster({
  posterUrl,
  title,
  size = 'w500',
  className = '',
  style = {},
  loading = 'lazy',
  sizes = '100vw',
  fetchPriority,
  variant,  // 'ambient' | 'contained' | undefined
}) {
  const [error, setError] = useState(false)

  // For ambient backgrounds, use a smaller image (it's blurred anyway)
  const effectiveSize = variant === 'ambient' ? 'w780' : size
  const resolvedUrl = resolveTmdbUrl(posterUrl, effectiveSize)
  // Only build srcSet for non-ambient (ambient doesn't need responsive sizes)
  const srcSet = variant === 'ambient' ? undefined : buildSrcSet(posterUrl)

  if (!resolvedUrl || error) {
    return (
      <div
        className={className}
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
          gap: 8,
          ...style,
        }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,75,137,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
          <line x1="7" y1="2" x2="7" y2="22" />
          <line x1="17" y1="2" x2="17" y2="22" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <line x1="2" y1="7" x2="7" y2="7" />
          <line x1="2" y1="17" x2="7" y2="17" />
          <line x1="17" y1="7" x2="22" y2="7" />
          <line x1="17" y1="17" x2="22" y2="17" />
        </svg>
        <div style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: 11,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.35)',
          textAlign: 'center',
          lineHeight: 1.3,
          maxWidth: '80%',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}>{title || 'No Poster'}</div>
      </div>
    )
  }

  // Ambient variant — blurred background layer
  if (variant === 'ambient') {
    return (
      <img
        src={resolvedUrl}
        alt=""
        aria-hidden="true"
        onError={() => setError(true)}
        className={`feed-ambient-bg ${className}`}
        style={style}
        loading={loading}
        decoding="async"
        draggable={false}
      />
    )
  }

  // Contained variant — crisp foreground poster
  if (variant === 'contained') {
    return (
      <img
        src={resolvedUrl}
        srcSet={srcSet}
        sizes={sizes}
        alt={title}
        onError={() => setError(true)}
        className={`feed-poster-contained ${className}`}
        style={style}
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
        draggable={false}
      />
    )
  }

  // Default variant — original behavior
  return (
    <img
      src={resolvedUrl}
      srcSet={srcSet}
      sizes={sizes}
      alt={title}
      onError={() => setError(true)}
      className={className}
      style={{ objectFit: 'cover', imageRendering: 'auto', ...style }}
      loading={loading}
      decoding="async"
      fetchPriority={fetchPriority}
      draggable={false}
    />
  )
}
