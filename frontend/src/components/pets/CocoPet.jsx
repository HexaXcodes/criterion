export default function CocoPet({ state = 'idle', size = 56 }) {
  const isSleep = state === 'sleep'

  return (
    <svg
      viewBox="0 0 100 120"
      width={size}
      height={size * 1.2}
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        <radialGradient id="cocoBodyGrad" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#b07848" />
          <stop offset="100%" stopColor="#6a3e20" />
        </radialGradient>
        <radialGradient id="cocoHeadGrad" cx="35%" cy="28%" r="65%">
          <stop offset="0%" stopColor="#b87848" />
          <stop offset="100%" stopColor="#6a3e20" />
        </radialGradient>
        <radialGradient id="cocoEarInner" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#f5e6d0" />
          <stop offset="100%" stopColor="#e0c8a8" />
        </radialGradient>
        <radialGradient id="cocoBlushGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f0a880" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#f0a880" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="cocoMuzzle" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#f5e6d0" />
          <stop offset="100%" stopColor="#dcc8a0" />
        </radialGradient>
        <radialGradient id="cocoEyeGrad" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#8b5e20" />
          <stop offset="100%" stopColor="#4a2800" />
        </radialGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="50" cy="113" rx="22" ry="5" fill="#000" opacity="0.18" />

      {/* Body */}
      <ellipse cx="50" cy="80" rx="29" ry="26" fill="url(#cocoBodyGrad)" style={{ animation: 'cocoRock 2.5s ease-in-out infinite' }} />
      {/* Body specular */}
      <ellipse cx="37" cy="68" rx="8" ry="5" fill="white" opacity="0.15" transform="rotate(-20 37 68)" />

      {/* Right arm — holds star */}
      <ellipse cx="74" cy="86" rx="9" ry="7" fill="url(#cocoBodyGrad)" transform="rotate(-30 74 86)" />

      {/* Left arm */}
      <ellipse cx="26" cy="86" rx="9" ry="7" fill="url(#cocoBodyGrad)" transform="rotate(30 26 86)" />

      {/* Star in right paw */}
      <text
        x="76"
        y="78"
        fontSize="13"
        fill="#ffd700"
        style={{ animation: 'starGlow 2s ease-in-out infinite' }}
      >
        ⭐
      </text>

      {/* Round ears */}
      <circle cx="28" cy="30" r="12" fill="url(#cocoBodyGrad)" />
      <circle cx="28" cy="30" r="7" fill="url(#cocoEarInner)" />
      <circle cx="72" cy="30" r="12" fill="url(#cocoBodyGrad)" />
      <circle cx="72" cy="30" r="7" fill="url(#cocoEarInner)" />

      {/* Head */}
      <circle cx="50" cy="50" r="26" fill="url(#cocoHeadGrad)" />
      {/* Head specular */}
      <ellipse cx="38" cy="38" rx="7" ry="4.5" fill="white" opacity="0.2" transform="rotate(-20 38 38)" />

      {/* Cream muzzle */}
      <ellipse cx="50" cy="58" rx="14" ry="11" fill="url(#cocoMuzzle)" />
      <ellipse cx="50" cy="55" rx="9" ry="5" fill="#e8d4b0" opacity="0.5" />

      {/* Nose */}
      <ellipse cx="50" cy="53" rx="3.5" ry="2.5" fill="#3a2010" />

      {/* Honey-brown eyes with big highlights */}
      {isSleep ? (
        <>
          <path d="M37 46 Q41 50 45 46" stroke="#7a4a20" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M55 46 Q59 50 63 46" stroke="#7a4a20" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="39" cy="46" r="6.5" fill="#3a2400" />
          <circle cx="39" cy="46" r="4.8" fill="url(#cocoEyeGrad)" />
          <circle cx="39" cy="46" r="3" fill="#2a1600" />
          <circle cx="41.5" cy="43.5" r="2.2" fill="white" />
          <circle cx="39.5" cy="48" r="0.8" fill="white" opacity="0.5" />

          <circle cx="61" cy="46" r="6.5" fill="#3a2400" />
          <circle cx="61" cy="46" r="4.8" fill="url(#cocoEyeGrad)" />
          <circle cx="61" cy="46" r="3" fill="#2a1600" />
          <circle cx="63.5" cy="43.5" r="2.2" fill="white" />
          <circle cx="61.5" cy="48" r="0.8" fill="white" opacity="0.5" />
        </>
      )}

      {/* Sweet smile */}
      <path d="M44 62 Q50 66 56 62" stroke="#4a2810" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Peach blush */}
      <ellipse cx="28" cy="54" rx="9" ry="7" fill="url(#cocoBlushGrad)" />
      <ellipse cx="72" cy="54" rx="9" ry="7" fill="url(#cocoBlushGrad)" />

      {/* Paws */}
      <ellipse cx="33" cy="104" rx="10" ry="7" fill="url(#cocoBodyGrad)" />
      <ellipse cx="67" cy="104" rx="10" ry="7" fill="url(#cocoBodyGrad)" />

      {/* Sleep ZZZ */}
      {isSleep && (
        <g opacity="0.8">
          <text x="78" y="22" fontSize="13" fill="#ffd700" fontFamily="serif" style={{ animation: 'zzzFloat 2s ease-in-out infinite' }}>z</text>
          <text x="86" y="15" fontSize="9" fill="#ffd700" fontFamily="serif" style={{ animation: 'zzzFloat 2s ease-in-out 0.6s infinite' }}>z</text>
        </g>
      )}
    </svg>
  )
}
