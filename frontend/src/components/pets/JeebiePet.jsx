export default function JeebiePet({ state = 'idle', size = 56 }) {
  return (
    <svg
      viewBox="0 0 100 120"
      width={size}
      height={size * 1.2}
      style={{ display: 'block', overflow: 'visible' }}
    >
      {/* Tail behind body — wags */}
      <g
        style={{
          transformOrigin: '70% 80%',
          animation: 'tailWag 0.6s ease-in-out infinite',
        }}
      >
        <path
          d="M75 90 Q88 75 92 60"
          stroke="#c86830"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
      </g>
      {/* Body */}
      <ellipse cx="50" cy="78" rx="30" ry="28" fill="#e8824a" />
      {/* Head */}
      <circle cx="50" cy="44" r="26" fill="#e8824a" />
      {/* Tabby stripes on head */}
      <path d="M30 30 Q35 28 40 30" stroke="#c05820" strokeWidth="2" fill="none" />
      <path d="M50 24 Q52 22 54 24" stroke="#c05820" strokeWidth="2" fill="none" />
      <path d="M60 30 Q65 28 70 30" stroke="#c05820" strokeWidth="2" fill="none" />

      {/* Left ear */}
      <polygon points="26,26 20,10 35,18" fill="#e8824a" />
      <polygon points="27,24 22,13 33,19" fill="#ffb1c3" opacity="0.7" />
      {/* Right ear */}
      <polygon points="74,26 80,10 65,18" fill="#e8824a" />
      <polygon points="73,24 78,13 67,19" fill="#ffb1c3" opacity="0.7" />

      {/* Big curious eyes */}
      <circle cx="39" cy="42" r="7" fill="#4a2800" />
      <circle cx="39" cy="42" r="5" fill="#2a1800" />
      <circle cx="41" cy="40" r="2.5" fill="white" />
      <circle cx="61" cy="42" r="7" fill="#4a2800" />
      <circle cx="61" cy="42" r="5" fill="#2a1800" />
      <circle cx="63" cy="40" r="2.5" fill="white" />

      {/* Peach blush */}
      <ellipse cx="29" cy="50" rx="7" ry="5" fill="#ffb899" opacity="0.6" />
      <ellipse cx="71" cy="50" rx="7" ry="5" fill="#ffb899" opacity="0.6" />

      {/* Tiny mouth */}
      <path
        d="M46 54 Q50 57 54 54"
        stroke="#7a3a18"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Paws */}
      <ellipse cx="32" cy="103" rx="11" ry="8" fill="#c86830" />
      <ellipse cx="68" cy="103" rx="11" ry="8" fill="#c86830" />
    </svg>
  )
}
