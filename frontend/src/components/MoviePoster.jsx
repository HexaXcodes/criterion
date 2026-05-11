import { useState } from 'react'

function resolveTmdbUrl(url, size) {
  if (!url || !size) return url
  // TMDB URLs look like: https://image.tmdb.org/t/p/w500/abc.jpg
  return url.replace(/\/t\/p\/w\d+\//, `/t/p/${size}/`)
}

export default function MoviePoster({ posterUrl, title, size = 'w500', className = '', style = {} }) {
  const [error, setError] = useState(false)
  const resolvedUrl = resolveTmdbUrl(posterUrl, size)

  if (!resolvedUrl || error) {
    return (
      <div
        className={className}
        style={{
          background: 'linear-gradient(135deg, #1f1f1f, #0e0e0e)',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          padding: 12,
          ...style,
        }}
      >
        <div className="brand-wordmark text-xs opacity-30">{title || 'CRITERION'}</div>
      </div>
    )
  }

  return (
    <img
      src={resolvedUrl}
      alt={title}
      onError={() => setError(true)}
      className={className}
      style={{ objectFit: 'cover', ...style }}
      loading="lazy"
    />
  )
}
