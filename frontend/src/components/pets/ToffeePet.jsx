export default function ToffeePet({ state = 'idle', size = 56 }) {
  return (
    <svg
      viewBox="0 0 100 120"
      width={size}
      height={size * 1.2}
      style={{ display: 'block', overflow: 'visible' }}
    >
      {/* Body — cream base */}
      <ellipse cx="50" cy="78" rx="30" ry="28" fill="#f0e0c0" />
      {/* Body patches */}
      <ellipse cx="35" cy="80" rx="14" ry="18" fill="#d4682a" />
      <ellipse cx="65" cy="82" rx="12" ry="14" fill="#3a2010" />

      {/* Head — cream base */}
      <circle cx="50" cy="44" r="26" fill="#f0e0c0" />
      {/* Head patches */}
      <path
        d="M28 44 Q26 30 38 28 Q42 38 35 50 Z"
        fill="#d4682a"
      />
      <path
        d="M70 36 Q78 36 78 50 Q70 52 65 44 Z"
        fill="#3a2010"
      />

      {/* Left ear (orange patch ear) */}
      <polygon points="26,26 20,10 35,18" fill="#d4682a" />
      <polygon points="27,24 22,13 33,19" fill="#ffb1c3" opacity="0.7" />
      {/* Right ear (dark patch ear) */}
      <polygon points="74,26 80,10 65,18" fill="#3a2010" />
      <polygon points="73,24 78,13 67,19" fill="#ffb1c3" opacity="0.7" />

      {/* Tiny green leaf on head */}
      <ellipse cx="50" cy="14" rx="5" ry="3" fill="#4aaa60" transform="rotate(-25 50 14)" />
      <line x1="50" y1="14" x2="48" y2="20" stroke="#3a8550" strokeWidth="1" />

      {/* Bright green eyes */}
      <circle cx="39" cy="42" r="6" fill="#4aaa60" />
      <circle cx="39" cy="42" r="4" fill="#2a7a40" />
      <circle cx="41" cy="40" r="1.5" fill="white" />
      <circle cx="61" cy="42" r="6" fill="#4aaa60" />
      <circle cx="61" cy="42" r="4" fill="#2a7a40" />
      <circle cx="63" cy="40" r="1.5" fill="white" />

      {/* Soft pink blush */}
      <ellipse cx="30" cy="50" rx="6" ry="4" fill="#ffb1c3" opacity="0.45" />
      <ellipse cx="70" cy="50" rx="6" ry="4" fill="#ffb1c3" opacity="0.45" />

      {/* Sweet smile */}
      <path
        d="M44 54 Q50 58 56 54"
        stroke="#5a3a18"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Paws */}
      <ellipse cx="32" cy="103" rx="11" ry="8" fill="#f0e0c0" />
      <ellipse cx="68" cy="103" rx="11" ry="8" fill="#3a2010" />
    </svg>
  )
}
