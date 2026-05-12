export default function BiscuitPet({ state = 'idle', size = 56 }) {
  return (
    <svg
      viewBox="0 0 100 125"
      width={size}
      height={size * 1.25}
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        <radialGradient id="biscuitBodyGrad" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#f0b858" />
          <stop offset="100%" stopColor="#c07828" />
        </radialGradient>
        <radialGradient id="biscuitHeadGrad" cx="35%" cy="28%" r="65%">
          <stop offset="0%" stopColor="#f0b858" />
          <stop offset="100%" stopColor="#c88030" />
        </radialGradient>
        <radialGradient id="biscuitEarGrad" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#d89038" />
          <stop offset="100%" stopColor="#a06018" />
        </radialGradient>
        <radialGradient id="biscuitSnoutGrad" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#f8d888" />
          <stop offset="100%" stopColor="#d4a850" />
        </radialGradient>
        <radialGradient id="biscuitBlushGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffcc88" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#ffcc88" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="biscuitEyeGrad" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#7a4820" />
          <stop offset="100%" stopColor="#3a2000" />
        </radialGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="50" cy="115" rx="24" ry="5" fill="#000" opacity="0.2" />

      {/* Wagging tail */}
      <g style={{ transformOrigin: '70% 80%', animation: 'tailWag 0.5s ease-in-out infinite' }}>
        <path d="M75 88 Q92 80 95 68" stroke="#c88030" strokeWidth="7" fill="none" strokeLinecap="round" />
      </g>

      {/* Body */}
      <ellipse cx="50" cy="80" rx="32" ry="28" fill="url(#biscuitBodyGrad)" />
      {/* Body specular */}
      <ellipse cx="36" cy="67" rx="9" ry="5.5" fill="white" opacity="0.16" transform="rotate(-20 36 67)" />

      {/* Head */}
      <circle cx="50" cy="44" r="26" fill="url(#biscuitHeadGrad)" />
      {/* Head specular */}
      <ellipse cx="37" cy="32" rx="8" ry="5" fill="white" opacity="0.18" transform="rotate(-20 37 32)" />

      {/* Floppy ears hanging down sides */}
      <ellipse cx="22" cy="48" rx="10" ry="20" fill="url(#biscuitEarGrad)" />
      <ellipse cx="78" cy="48" rx="10" ry="20" fill="url(#biscuitEarGrad)" />
      {/* Ear highlights */}
      <ellipse cx="20" cy="40" rx="4" ry="8" fill="white" opacity="0.1" transform="rotate(-5 20 40)" />
      <ellipse cx="80" cy="40" rx="4" ry="8" fill="white" opacity="0.1" transform="rotate(5 80 40)" />

      {/* Snout */}
      <ellipse cx="50" cy="55" rx="14" ry="11" fill="url(#biscuitSnoutGrad)" />

      {/* Nose */}
      <ellipse cx="50" cy="50" rx="4.5" ry="3.5" fill="#1a1a1a" />
      <ellipse cx="49" cy="49" rx="1.5" ry="1" fill="white" opacity="0.3" />

      {/* Mouth with tongue */}
      <path d="M44 60 Q50 64 56 60" stroke="#7a4f1a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <ellipse cx="50" cy="63" rx="3" ry="2" fill="#ff8080" />

      {/* Friendly eyes with depth */}
      <circle cx="39" cy="40" r="6" fill="#2a1400" />
      <circle cx="39" cy="40" r="4.5" fill="url(#biscuitEyeGrad)" />
      <circle cx="39" cy="40" r="2.8" fill="#2a1400" />
      <circle cx="41.5" cy="37.5" r="2" fill="white" />
      <circle cx="39.5" cy="42" r="0.8" fill="white" opacity="0.5" />

      <circle cx="61" cy="40" r="6" fill="#2a1400" />
      <circle cx="61" cy="40" r="4.5" fill="url(#biscuitEyeGrad)" />
      <circle cx="61" cy="40" r="2.8" fill="#2a1400" />
      <circle cx="63.5" cy="37.5" r="2" fill="white" />
      <circle cx="61.5" cy="42" r="0.8" fill="white" opacity="0.5" />

      {/* Cheek blush — radial fade */}
      <ellipse cx="29" cy="55" rx="9" ry="7" fill="url(#biscuitBlushGrad)" />
      <ellipse cx="71" cy="55" rx="9" ry="7" fill="url(#biscuitBlushGrad)" />

      {/* Paws */}
      <ellipse cx="34" cy="106" rx="11" ry="8" fill="url(#biscuitEarGrad)" />
      <ellipse cx="66" cy="106" rx="11" ry="8" fill="url(#biscuitEarGrad)" />
    </svg>
  )
}
