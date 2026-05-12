export default function MochiPet({ state = 'idle', size = 56 }) {
  const isSleep = state === 'sleep'

  return (
    <svg
      viewBox="0 0 100 120"
      width={size}
      height={size * 1.2}
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        <radialGradient id="mochiBodyGrad" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#dcdcdc" />
        </radialGradient>
        <radialGradient id="mochiHeadGrad" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e0e0e0" />
        </radialGradient>
        <radialGradient id="mochiBlushGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffb1c3" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#ffb1c3" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="mochiEarInner" cx="50%" cy="70%" r="55%">
          <stop offset="0%" stopColor="#ffb1c3" />
          <stop offset="100%" stopColor="#ff8aab" stopOpacity="0.6" />
        </radialGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="50" cy="113" rx="22" ry="5" fill="#000" opacity="0.18" />

      {/* Cotton-ball tail */}
      <circle cx="74" cy="88" r="7" fill="url(#mochiBodyGrad)" opacity="0.9" />
      <circle cx="72" cy="86" r="4" fill="white" opacity="0.6" />

      {/* Body */}
      <ellipse cx="50" cy="80" rx="29" ry="26" fill="url(#mochiBodyGrad)" />
      {/* Body specular */}
      <ellipse cx="38" cy="68" rx="8" ry="5" fill="white" opacity="0.18" transform="rotate(-20 38 68)" />

      {/* Left ear — tall with pink inner */}
      <ellipse cx="30" cy="22" rx="8" ry="20" fill="url(#mochiBodyGrad)" />
      <ellipse cx="30" cy="24" rx="4.5" ry="15" fill="url(#mochiEarInner)" opacity="0.85" />

      {/* Right ear */}
      <ellipse cx="70" cy="22" rx="8" ry="20" fill="url(#mochiBodyGrad)" />
      <ellipse cx="70" cy="24" rx="4.5" ry="15" fill="url(#mochiEarInner)" opacity="0.85" />

      {/* Head */}
      <circle cx="50" cy="52" r="26" fill="url(#mochiHeadGrad)" />
      {/* Head specular */}
      <ellipse cx="38" cy="40" rx="7" ry="4.5" fill="white" opacity="0.2" transform="rotate(-20 38 40)" />

      {/* Eyes */}
      {isSleep ? (
        <>
          <path d="M37 50 Q41 54 45 50" stroke="#aaa" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M55 50 Q59 54 63 50" stroke="#aaa" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="40" cy="50" r="6.5" fill="#1a1a1a" />
          <circle cx="40" cy="50" r="4.5" fill="#0d0d0d" />
          <circle cx="42.5" cy="47.5" r="2" fill="white" />
          <circle cx="39" cy="52.5" r="0.8" fill="white" opacity="0.6" />
          <circle cx="60" cy="50" r="6.5" fill="#1a1a1a" />
          <circle cx="60" cy="50" r="4.5" fill="#0d0d0d" />
          <circle cx="62.5" cy="47.5" r="2" fill="white" />
          <circle cx="59" cy="52.5" r="0.8" fill="white" opacity="0.6" />
        </>
      )}

      {/* Nose — tiny upside-down triangle pink */}
      <polygon points="50,55 47.5,58.5 52.5,58.5" fill="#ffb1c3" />

      {/* Blush — radial fade */}
      <ellipse cx="30" cy="56" rx="9" ry="7" fill="url(#mochiBlushGrad)" />
      <ellipse cx="70" cy="56" rx="9" ry="7" fill="url(#mochiBlushGrad)" />

      {/* Paws */}
      <ellipse cx="33" cy="104" rx="10" ry="7" fill="url(#mochiBodyGrad)" />
      <ellipse cx="67" cy="104" rx="10" ry="7" fill="url(#mochiBodyGrad)" />

      {/* Ear wiggle animation targets (for CSS) */}
      <g className="mochi-ear-left" style={{ transformOrigin: '30px 42px', animation: 'mochiEarWig 1.6s ease-in-out infinite' }}>
        <rect x="0" y="0" width="0" height="0" fill="none" />
      </g>

      {/* Sleep ZZZ */}
      {isSleep && (
        <g opacity="0.8">
          <text x="78" y="22" fontSize="13" fill="#ffb1c3" fontFamily="serif" style={{ animation: 'zzzFloat 2s ease-in-out infinite' }}>z</text>
          <text x="86" y="15" fontSize="9" fill="#ffb1c3" fontFamily="serif" style={{ animation: 'zzzFloat 2s ease-in-out 0.6s infinite' }}>z</text>
        </g>
      )}
    </svg>
  )
}
