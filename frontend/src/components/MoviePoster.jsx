import { useState } from 'react'

export default function MoviePoster({ posterUrl, title, className = '', style = {} }) {
  const [error, setError] = useState(false)

  if (!posterUrl || error) {
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
      src={posterUrl}
      alt={title}
      onError={() => setError(true)}
      className={className}
      style={{ objectFit: 'cover', ...style }}
      loading="lazy"
    />
  )
}
