export default function BiscuitPet({ state = 'idle', size = 56 }) {
  return (
    <svg
      viewBox="0 0 100 125"
      width={size}
      height={size * 1.25}
      style={{ display: 'block', overflow: 'visible' }}
    >
      {/* Wagging tail behind */}
      <g
        style={{
          transformOrigin: '70% 80%',
          animation: 'tailWag 0.5s ease-in-out infinite',
        }}
      >
        <path
          d="M75 88 Q92 80 95 68"
          stroke="#c88030"
          strokeWidth="7"
          fill="none"
          strokeLinecap="round"
        />
      </g>

      {/* Body */}
      <ellipse cx="50" cy="80" rx="32" ry="28" fill="#e8a84c" />

      {/* Head */}
      <circle cx="50" cy="44" r="26" fill="#e8a84c" />

      {/* Floppy ears hanging down sides */}
      <ellipse cx="22" cy="48" rx="10" ry="20" fill="#c88030" />
      <ellipse cx="78" cy="48" rx="10" ry="20" fill="#c88030" />

      {/* Snout */}
      <ellipse cx="50" cy="55" rx="14" ry="11" fill="#f0c870" />

      {/* Nose */}
      <ellipse cx="50" cy="50" rx="4.5" ry="3.5" fill="#1a1a1a" />

      {/* Mouth with tongue */}
      <path
        d="M44 60 Q50 64 56 60"
        stroke="#7a4f1a"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx="50" cy="63" rx="3" ry="2" fill="#ff8080" />

      {/* Friendly eyes */}
      <circle cx="39" cy="40" r="5" fill="#5a3000" />
      <circle cx="39" cy="40" r="3.5" fill="#3a1f00" />
      <circle cx="41" cy="38" r="1.5" fill="white" />
      <circle cx="61" cy="40" r="5" fill="#5a3000" />
      <circle cx="61" cy="40" r="3.5" fill="#3a1f00" />
      <circle cx="63" cy="38" r="1.5" fill="white" />

      {/* Cheek blush */}
      <ellipse cx="29" cy="55" rx="6" ry="4" fill="#ffcc88" opacity="0.5" />
      <ellipse cx="71" cy="55" rx="6" ry="4" fill="#ffcc88" opacity="0.5" />

      {/* Paws */}
      <ellipse cx="34" cy="106" rx="11" ry="8" fill="#c88030" />
      <ellipse cx="66" cy="106" rx="11" ry="8" fill="#c88030" />
    </svg>
  )
}
