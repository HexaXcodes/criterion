export default function PepperPet({ state = 'idle', size = 56 }) {
  const isSleep = state === 'sleep'

  return (
    <svg
      viewBox="0 0 100 120"
      width={size}
      height={size * 1.2}
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        <radialGradient id="pepperBodyGrad" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#cec6e0" />
          <stop offset="100%" stopColor="#8880a8" />
        </radialGradient>
        <radialGradient id="pepperHeadGrad" cx="35%" cy="28%" r="65%">
          <stop offset="0%" stopColor="#d4cce4" />
          <stop offset="100%" stopColor="#9088b8" />
        </radialGradient>
        <radialGradient id="pepperBlushGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c8a0d8" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#c8a0d8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="pepperEarGrad" cx="50%" cy="80%" r="55%">
          <stop offset="0%" stopColor="#e8a0b8" />
          <stop offset="100%" stopColor="#d080a0" stopOpacity="0.5" />
        </radialGradient>
        <radialGradient id="pepperChestGrad" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#f0ece8" />
          <stop offset="100%" stopColor="#e0d8d4" stopOpacity="0.4" />
        </radialGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="50" cy="113" rx="22" ry="5" fill="#000" opacity="0.18" />

      {/* Floppy ears drooping down sides — bezier paths */}
      <path
        d="M28 44 C10 48 8 75 20 82 C26 86 34 80 32 70 C30 58 26 50 28 44 Z"
        fill="url(#pepperBodyGrad)"
        style={{ animation: 'pepperEarSway 2s ease-in-out infinite' }}
      />
      {/* Left ear inner strip */}
      <path
        d="M26 47 C14 52 13 74 22 79 C26 81 30 76 29 68 C27 59 25 52 26 47 Z"
        fill="url(#pepperEarGrad)"
        opacity="0.75"
        style={{ animation: 'pepperEarSway 2s ease-in-out infinite' }}
      />

      <path
        d="M72 44 C90 48 92 75 80 82 C74 86 66 80 68 70 C70 58 74 50 72 44 Z"
        fill="url(#pepperBodyGrad)"
        style={{ animation: 'pepperEarSway 2s ease-in-out infinite' }}
      />
      {/* Right ear inner strip */}
      <path
        d="M74 47 C86 52 87 74 78 79 C74 81 70 76 71 68 C73 59 75 52 74 47 Z"
        fill="url(#pepperEarGrad)"
        opacity="0.75"
        style={{ animation: 'pepperEarSway 2s ease-in-out infinite' }}
      />

      {/* Body */}
      <ellipse cx="50" cy="80" rx="28" ry="26" fill="url(#pepperBodyGrad)" />
      {/* Fluffy white chest */}
      <ellipse cx="50" cy="78" rx="16" ry="18" fill="url(#pepperChestGrad)" />
      {/* Body specular */}
      <ellipse cx="38" cy="68" rx="7" ry="4.5" fill="white" opacity="0.18" transform="rotate(-20 38 68)" />

      {/* Head */}
      <circle cx="50" cy="50" r="26" fill="url(#pepperHeadGrad)" />
      {/* Head specular */}
      <ellipse cx="38" cy="38" rx="7" ry="4.5" fill="white" opacity="0.2" transform="rotate(-20 38 38)" />

      {/* TEAL eyes — the standout feature */}
      {isSleep ? (
        <>
          <path d="M36 50 Q41 54 46 50" stroke="#7070a0" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M54 50 Q59 54 64 50" stroke="#7070a0" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="40" cy="50" r="7" fill="#004050" />
          <circle cx="40" cy="50" r="5.5" fill="#00bcd4" style={{ animation: 'pepperBlink 6s ease-in-out infinite' }} />
          <circle cx="40" cy="50" r="3.5" fill="#007090" />
          <circle cx="42.5" cy="47.5" r="2.2" fill="white" />
          <circle cx="40.5" cy="52" r="0.8" fill="white" opacity="0.5" />

          <circle cx="60" cy="50" r="7" fill="#004050" />
          <circle cx="60" cy="50" r="5.5" fill="#00bcd4" style={{ animation: 'pepperBlink 6s ease-in-out 0.3s infinite' }} />
          <circle cx="60" cy="50" r="3.5" fill="#007090" />
          <circle cx="62.5" cy="47.5" r="2.2" fill="white" />
          <circle cx="60.5" cy="52" r="0.8" fill="white" opacity="0.5" />
        </>
      )}

      {/* Tiny pink nose */}
      <ellipse cx="50" cy="56" rx="2.5" ry="1.8" fill="#d080a0" />

      {/* Blush — lavender fade */}
      <ellipse cx="29" cy="57" rx="10" ry="8" fill="url(#pepperBlushGrad)" />
      <ellipse cx="71" cy="57" rx="10" ry="8" fill="url(#pepperBlushGrad)" />

      {/* Paws */}
      <ellipse cx="33" cy="103" rx="10" ry="7" fill="url(#pepperBodyGrad)" />
      <ellipse cx="67" cy="103" rx="10" ry="7" fill="url(#pepperBodyGrad)" />

      {/* Sleep ZZZ */}
      {isSleep && (
        <g opacity="0.8">
          <text x="78" y="22" fontSize="13" fill="#c8a0d8" fontFamily="serif" style={{ animation: 'zzzFloat 2s ease-in-out infinite' }}>z</text>
          <text x="86" y="15" fontSize="9" fill="#c8a0d8" fontFamily="serif" style={{ animation: 'zzzFloat 2s ease-in-out 0.6s infinite' }}>z</text>
        </g>
      )}
    </svg>
  )
}
