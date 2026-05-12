export default function PuddingPet({ state = 'idle', size = 56 }) {
  return (
    <svg
      viewBox="0 0 100 120"
      width={size}
      height={size * 1.2}
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        <radialGradient id="puddingBodyGrad" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#f8ecc0" />
          <stop offset="100%" stopColor="#d4b870" />
        </radialGradient>
        <radialGradient id="puddingHeadGrad" cx="35%" cy="28%" r="65%">
          <stop offset="0%" stopColor="#f8ecc0" />
          <stop offset="100%" stopColor="#d4b870" />
        </radialGradient>
        <radialGradient id="puddingCheekGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffb899" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#ffb899" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="puddingPouchGrad" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#fde8b0" />
          <stop offset="100%" stopColor="#c8a050" />
        </radialGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="50" cy="114" rx="26" ry="5" fill="#000" opacity="0.18" />

      {/* Body — nearly spherical */}
      <ellipse cx="50" cy="82" rx="30" ry="26" fill="url(#puddingBodyGrad)" style={{ animation: 'puddingJiggle 0.4s ease-in-out infinite' }} />
      {/* Body specular */}
      <ellipse cx="37" cy="70" rx="8" ry="5" fill="white" opacity="0.2" transform="rotate(-20 37 70)" />

      {/* Stub arms barely visible */}
      <ellipse cx="22" cy="88" rx="6" ry="4" fill="url(#puddingBodyGrad)" opacity="0.8" transform="rotate(-20 22 88)" />
      <ellipse cx="78" cy="88" rx="6" ry="4" fill="url(#puddingBodyGrad)" opacity="0.8" transform="rotate(20 78 88)" />

      {/* HUGE cheek pouches — defining feature */}
      <ellipse cx="18" cy="60" rx="16" ry="14" fill="url(#puddingPouchGrad)" />
      <ellipse cx="82" cy="60" rx="16" ry="14" fill="url(#puddingPouchGrad)" />
      {/* Pouch specular */}
      <ellipse cx="13" cy="54" rx="5" ry="3.5" fill="white" opacity="0.18" transform="rotate(-10 13 54)" />
      <ellipse cx="87" cy="54" rx="5" ry="3.5" fill="white" opacity="0.18" transform="rotate(10 87 54)" />

      {/* Head */}
      <circle cx="50" cy="50" r="24" fill="url(#puddingHeadGrad)" />
      {/* Head specular */}
      <ellipse cx="39" cy="39" rx="7" ry="4.5" fill="white" opacity="0.2" transform="rotate(-20 39 39)" />

      {/* Tiny ears barely visible on top */}
      <ellipse cx="37" cy="28" rx="6" ry="5" fill="url(#puddingHeadGrad)" />
      <ellipse cx="63" cy="28" rx="6" ry="5" fill="url(#puddingHeadGrad)" />
      <ellipse cx="37" cy="29" rx="3.5" ry="3" fill="#ffb1c3" opacity="0.5" />
      <ellipse cx="63" cy="29" rx="3.5" ry="3" fill="#ffb1c3" opacity="0.5" />

      {/* Tiny eyes (look small vs giant cheeks) */}
      <circle cx="43" cy="50" r="4" fill="#1a1a1a" />
      <circle cx="43" cy="50" r="2.8" fill="#0d0d0d" />
      <circle cx="44.5" cy="48.5" r="1.2" fill="white" />
      <circle cx="57" cy="50" r="4" fill="#1a1a1a" />
      <circle cx="57" cy="50" r="2.8" fill="#0d0d0d" />
      <circle cx="58.5" cy="48.5" r="1.2" fill="white" />

      {/* Tiny nose */}
      <ellipse cx="50" cy="55" rx="2.5" ry="1.8" fill="#c08040" />

      {/* Blush dots on cheeks */}
      <ellipse cx="18" cy="62" rx="7" ry="6" fill="url(#puddingCheekGrad)" />
      <ellipse cx="82" cy="62" rx="7" ry="6" fill="url(#puddingCheekGrad)" />

      {/* Paws */}
      <ellipse cx="35" cy="106" rx="10" ry="7" fill="url(#puddingBodyGrad)" />
      <ellipse cx="65" cy="106" rx="10" ry="7" fill="url(#puddingBodyGrad)" />
    </svg>
  )
}
