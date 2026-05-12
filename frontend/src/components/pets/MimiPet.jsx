export default function MimiPet({ state = 'idle', size = 56 }) {
  const isSleep = state === 'sleep'

  return (
    <svg
      viewBox="0 0 100 120"
      width={size}
      height={size * 1.2}
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        <radialGradient id="mimiBodyGrad" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#2a2a2a" />
          <stop offset="100%" stopColor="#0d0d0d" />
        </radialGradient>
        <radialGradient id="mimiHeadGrad" cx="35%" cy="28%" r="65%">
          <stop offset="0%" stopColor="#2e2e2e" />
          <stop offset="100%" stopColor="#0f0f0f" />
        </radialGradient>
        <radialGradient id="mimiBlushGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff9a72" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#ff9a72" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="mimiEarInner" cx="50%" cy="60%" r="55%">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#9b4dca" stopOpacity="0.4" />
        </radialGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="50" cy="112" rx="22" ry="5" fill="#000" opacity="0.22" />

      {/* Body */}
      <ellipse cx="50" cy="78" rx="30" ry="28" fill="url(#mimiBodyGrad)" />
      {/* Body specular */}
      <ellipse cx="36" cy="66" rx="8" ry="5" fill="white" opacity="0.12" transform="rotate(-20 36 66)" />

      {/* Left ear */}
      <polygon points="26,26 20,10 35,18" fill="url(#mimiBodyGrad)" />
      <polygon points="27,24 22,13 33,19" fill="url(#mimiEarInner)" opacity="0.8" />
      {/* Right ear */}
      <polygon points="74,26 80,10 65,18" fill="url(#mimiBodyGrad)" />
      <polygon points="73,24 78,13 67,19" fill="url(#mimiEarInner)" opacity="0.8" />

      {/* Head */}
      <circle cx="50" cy="44" r="26" fill="url(#mimiHeadGrad)" />
      {/* Head specular */}
      <ellipse cx="37" cy="32" rx="7" ry="4.5" fill="white" opacity="0.16" transform="rotate(-20 37 32)" />

      {/* Eyes */}
      {isSleep ? (
        <>
          <path d="M33 42 Q39 46 45 42" stroke="#3a3a3a" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M55 42 Q61 46 67 42" stroke="#3a3a3a" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="39" cy="42" r="7" fill="#1a1a1a" />
          <circle cx="39" cy="42" r="5" fill="#0a0a0a" />
          <circle cx="39" cy="42" r="3" fill="#111" />
          <circle cx="41.5" cy="39.5" r="2" fill="white" />
          <circle cx="39.5" cy="44" r="0.8" fill="white" opacity="0.5" />

          <circle cx="61" cy="42" r="7" fill="#1a1a1a" />
          <circle cx="61" cy="42" r="5" fill="#0a0a0a" />
          <circle cx="61" cy="42" r="3" fill="#111" />
          <circle cx="63.5" cy="39.5" r="2" fill="white" />
          <circle cx="61.5" cy="44" r="0.8" fill="white" opacity="0.5" />
        </>
      )}

      {/* Blush — radial fade */}
      <ellipse cx="30" cy="49" rx="10" ry="8" fill="url(#mimiBlushGrad)" />
      <ellipse cx="70" cy="49" rx="10" ry="8" fill="url(#mimiBlushGrad)" />

      {/* Smile */}
      <path d="M44 53 Q50 57 56 53" stroke="#444" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Paws */}
      <ellipse cx="32" cy="103" rx="11" ry="8" fill="url(#mimiBodyGrad)" />
      <ellipse cx="68" cy="103" rx="11" ry="8" fill="url(#mimiBodyGrad)" />

      {/* Sleep ZZZ */}
      {isSleep && (
        <g opacity="0.8">
          <text x="78" y="20" fontSize="14" fill="#ff9ab8" fontFamily="serif" style={{ animation: 'zzzFloat 2s ease-in-out infinite' }}>z</text>
          <text x="86" y="14" fontSize="10" fill="#ff9ab8" fontFamily="serif" style={{ animation: 'zzzFloat 2s ease-in-out 0.6s infinite' }}>z</text>
        </g>
      )}
    </svg>
  )
}
