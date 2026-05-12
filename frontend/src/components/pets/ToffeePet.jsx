export default function ToffeePet({ state = 'idle', size = 56 }) {
  return (
    <svg
      viewBox="0 0 100 120"
      width={size}
      height={size * 1.2}
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        <radialGradient id="toffeeBodyGrad" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#f8ead0" />
          <stop offset="100%" stopColor="#c8c0a8" />
        </radialGradient>
        <radialGradient id="toffeePatchOrange" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#e07830" />
          <stop offset="100%" stopColor="#a04818" />
        </radialGradient>
        <radialGradient id="toffeePatchDark" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#5a3820" />
          <stop offset="100%" stopColor="#2a1408" />
        </radialGradient>
        <radialGradient id="toffeeHeadGrad" cx="35%" cy="28%" r="65%">
          <stop offset="0%" stopColor="#f8ead0" />
          <stop offset="100%" stopColor="#c8b888" />
        </radialGradient>
        <radialGradient id="toffeeBlushGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffb1c3" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffb1c3" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="toffeeEarInner" cx="50%" cy="60%" r="55%">
          <stop offset="0%" stopColor="#ffb1c3" />
          <stop offset="100%" stopColor="#ff80a0" stopOpacity="0.3" />
        </radialGradient>
        <radialGradient id="toffeeEyeGrad" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#6acd80" />
          <stop offset="100%" stopColor="#2a7a40" />
        </radialGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="50" cy="112" rx="22" ry="5" fill="#000" opacity="0.2" />

      {/* Body — cream base */}
      <ellipse cx="50" cy="78" rx="30" ry="28" fill="url(#toffeeBodyGrad)" />
      {/* Body patches */}
      <ellipse cx="35" cy="80" rx="14" ry="18" fill="url(#toffeePatchOrange)" opacity="0.9" />
      <ellipse cx="65" cy="82" rx="12" ry="14" fill="url(#toffeePatchDark)" opacity="0.9" />
      {/* Body specular */}
      <ellipse cx="36" cy="66" rx="8" ry="5" fill="white" opacity="0.16" transform="rotate(-20 36 66)" />

      {/* Head — cream base */}
      <circle cx="50" cy="44" r="26" fill="url(#toffeeHeadGrad)" />
      {/* Head patches */}
      <path d="M28 44 Q26 30 38 28 Q42 38 35 50 Z" fill="url(#toffeePatchOrange)" opacity="0.85" />
      <path d="M70 36 Q78 36 78 50 Q70 52 65 44 Z" fill="url(#toffeePatchDark)" opacity="0.85" />
      {/* Head specular */}
      <ellipse cx="37" cy="32" rx="7" ry="4.5" fill="white" opacity="0.18" transform="rotate(-20 37 32)" />

      {/* Left ear (orange patch ear) */}
      <polygon points="26,26 20,10 35,18" fill="url(#toffeePatchOrange)" />
      <polygon points="27,24 22,13 33,19" fill="url(#toffeeEarInner)" opacity="0.8" />
      {/* Right ear (dark patch ear) */}
      <polygon points="74,26 80,10 65,18" fill="url(#toffeePatchDark)" />
      <polygon points="73,24 78,13 67,19" fill="url(#toffeeEarInner)" opacity="0.8" />

      {/* Tiny green leaf on head */}
      <ellipse cx="50" cy="14" rx="5" ry="3" fill="#4aaa60" transform="rotate(-25 50 14)" />
      <line x1="50" y1="14" x2="48" y2="20" stroke="#3a8550" strokeWidth="1" />

      {/* Bright green eyes with depth */}
      <circle cx="39" cy="42" r="7" fill="#1a5030" />
      <circle cx="39" cy="42" r="5" fill="url(#toffeeEyeGrad)" />
      <circle cx="39" cy="42" r="3" fill="#2a7a40" />
      <circle cx="41.5" cy="39.5" r="2" fill="white" />
      <circle cx="39.5" cy="44" r="0.8" fill="white" opacity="0.5" />

      <circle cx="61" cy="42" r="7" fill="#1a5030" />
      <circle cx="61" cy="42" r="5" fill="url(#toffeeEyeGrad)" />
      <circle cx="61" cy="42" r="3" fill="#2a7a40" />
      <circle cx="63.5" cy="39.5" r="2" fill="white" />
      <circle cx="61.5" cy="44" r="0.8" fill="white" opacity="0.5" />

      {/* Soft pink blush — radial fade */}
      <ellipse cx="30" cy="50" rx="9" ry="7" fill="url(#toffeeBlushGrad)" />
      <ellipse cx="70" cy="50" rx="9" ry="7" fill="url(#toffeeBlushGrad)" />

      {/* Sweet smile */}
      <path d="M44 54 Q50 58 56 54" stroke="#5a3a18" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Paws */}
      <ellipse cx="32" cy="103" rx="11" ry="8" fill="url(#toffeeBodyGrad)" />
      <ellipse cx="68" cy="103" rx="11" ry="8" fill="url(#toffeePatchDark)" />
    </svg>
  )
}
