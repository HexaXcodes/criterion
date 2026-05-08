export default function StarRating({ rating = 0, size = 14, interactive = false, onChange, color = '#00dbe9' }) {
  const stars = [1, 2, 3, 4, 5]
  const fullStars = Math.round(Number(rating) || 0)

  return (
    <div className="stars-container">
      {stars.map((n) => {
        const filled = n <= fullStars
        return (
          <button
            key={n}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(n)}
            style={{
              padding: 0,
              border: 'none',
              background: 'transparent',
              cursor: interactive ? 'pointer' : 'default',
              transition: 'transform 150ms',
            }}
          >
            <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={color} strokeWidth="1.5" strokeLinejoin="round">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </button>
        )
      })}
    </div>
  )
}
