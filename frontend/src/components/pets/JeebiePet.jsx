export default function JeebiePet({ state = 'idle', size = 56 }) {
  return (
    <svg
      viewBox="0 0 100 120"
      width={size}
      height={size * 1.2}
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        <radialGradient id="jeebieBodyGrad" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#f09050" />
          <stop offset="100%" stopColor="#b85820" />
        </radialGradient>
        <radialGradient id="jeebieHeadGrad" cx="35%" cy="28%" r="65%">
          <stop offset="0%" stopColor="#f29858" />
          <stop offset="100%" stopColor="#c06028" />
        </radialGradient>
        <radialGradient id="jeebieBlushGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffb899" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#ffb899" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="jeebieEarInner" cx="50%" cy="60%" r="55%">
          <stop offset="0%" stopColor="#ffb1c3" />
          <stop offset="100%" stopColor="#ff80a0" stopOpacity="0.4" />
        </radialGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="50" cy="112" rx="22" ry="5" fill="#000" opacity="0.2" />

      {/* Tail — wags */}
      <g style={{ transformOrigin: '70% 80%', animation: 'tailWag 0.6s ease-in-out infinite' }}>
        <path d="M75 90 Q88 75 92 60" stroke="#c86830" strokeWidth="6" fill="none" strokeLinecap="round" />
      </g>

      {/* Body */}
      <ellipse cx="50" cy="78" rx="30" ry="28" fill="url(#jeebieBodyGrad)" />
      {/* Body specular */}
      <ellipse cx="36" cy="66" rx="8" ry="5" fill="white" opacity="0.15" transform="rotate(-20 36 66)" />

      {/* Left ear */}
      <polygon points="26,26 20,10 35,18" fill="url(#jeebieBodyGrad)" />
      <polygon points="27,24 22,13 33,19" fill="url(#jeebieEarInner)" opacity="0.8" />
      {/* Right ear */}
      <polygon points="74,26 80,10 65,18" fill="url(#jeebieBodyGrad)" />
      <polygon points="73,24 78,13 67,19" fill="url(#jeebieEarInner)" opacity="0.8" />

      {/* Head */}
      <circle cx="50" cy="44" r="26" fill="url(#jeebieHeadGrad)" />
      {/* Tabby stripes */}
      <path d="M30 30 Q35 28 40 30" stroke="#c05820" strokeWidth="2" fill="none" />
      <path d="M50 24 Q52 22 54 24" stroke="#c05820" strokeWidth="2" fill="none" />
      <path d="M60 30 Q65 28 70 30" stroke="#c05820" strokeWidth="2" fill="none" />
      {/* Head specular */}
      <ellipse cx="37" cy="32" rx="7" ry="4.5" fill="white" opacity="0.18" transform="rotate(-20 37 32)" />

      {/* Big curious eyes */}
      <circle cx="39" cy="42" r="7.5" fill="#3a1800" />
      <circle cx="39" cy="42" r="5.5" fill="#6a3800" />
      <circle cx="39" cy="42" r="3.5" fill="#2a1000" />
      <circle cx="41.5" cy="39.5" r="2.5" fill="white" />
      <circle cx="39.5" cy="44.5" r="0.9" fill="white" opacity="0.5" />

      <circle cx="61" cy="42" r="7.5" fill="#3a1800" />
      <circle cx="61" cy="42" r="5.5" fill="#6a3800" />
      <circle cx="61" cy="42" r="3.5" fill="#2a1000" />
      <circle cx="63.5" cy="39.5" r="2.5" fill="white" />
      <circle cx="61.5" cy="44.5" r="0.9" fill="white" opacity="0.5" />

      {/* Blush — radial fade */}
      <ellipse cx="29" cy="50" rx="10" ry="8" fill="url(#jeebieBlushGrad)" />
      <ellipse cx="71" cy="50" rx="10" ry="8" fill="url(#jeebieBlushGrad)" />

      {/* Tiny mouth */}
      <path d="M46 54 Q50 57 54 54" stroke="#7a3a18" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Paws */}
      <ellipse cx="32" cy="103" rx="11" ry="8" fill="#c86830" />
      <ellipse cx="68" cy="103" rx="11" ry="8" fill="#c86830" />
    </svg>
  )
}
