export default function MimiPet({ state = 'idle', size = 56 }) {
  const isSleep = state === 'sleep'

  return (
    <svg
      viewBox="0 0 100 120"
      width={size}
      height={size * 1.2}
      style={{ display: 'block', overflow: 'visible' }}
    >
      {/* Body */}
      <ellipse cx="50" cy="78" rx="30" ry="28" fill="#1a1a1a" />
      {/* Head */}
      <circle cx="50" cy="44" r="26" fill="#1a1a1a" />
      {/* Left ear */}
      <polygon points="26,26 20,10 35,18" fill="#1a1a1a" />
      <polygon points="27,24 22,13 33,19" fill="#c084fc" opacity="0.7" />
      {/* Right ear */}
      <polygon points="74,26 80,10 65,18" fill="#1a1a1a" />
      <polygon points="73,24 78,13 67,19" fill="#c084fc" opacity="0.7" />

      {/* Eyes — sleeping shows curved lines, awake shows round eyes */}
      {isSleep ? (
        <>
          <path
            d="M33 42 Q39 46 45 42"
            stroke="#3a3a3a"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M55 42 Q61 46 67 42"
            stroke="#3a3a3a"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <circle cx="39" cy="42" r="6" fill="#222" />
          <circle cx="39" cy="42" r="4" fill="#111" />
          <circle cx="41" cy="40" r="1.5" fill="white" />
          <circle cx="61" cy="42" r="6" fill="#222" />
          <circle cx="61" cy="42" r="4" fill="#111" />
          <circle cx="63" cy="40" r="1.5" fill="white" />
        </>
      )}

      {/* Blush left/right */}
      <ellipse cx="30" cy="49" rx="7" ry="5" fill="#ff9a72" opacity="0.5" />
      <ellipse cx="70" cy="49" rx="7" ry="5" fill="#ff9a72" opacity="0.5" />

      {/* Smile */}
      <path
        d="M44 53 Q50 57 56 53"
        stroke="#444"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Paws */}
      <ellipse cx="32" cy="103" rx="11" ry="8" fill="#1a1a1a" />
      <ellipse cx="68" cy="103" rx="11" ry="8" fill="#1a1a1a" />

      {/* Sleep zzz bubbles */}
      {isSleep && (
        <g opacity="0.7">
          <text x="78" y="20" fontSize="14" fill="#ff9ab8" fontFamily="serif">
            z
          </text>
          <text x="86" y="14" fontSize="10" fill="#ff9ab8" fontFamily="serif">
            z
          </text>
        </g>
      )}
    </svg>
  )
}
