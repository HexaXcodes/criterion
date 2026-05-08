import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function LandingPage() {
  const navigate = useNavigate()
  const [showGuestModal, setShowGuestModal] = useState(false)

  const handleEnter = () => navigate('/login')
  const handleBrowse = () => {
    if (sessionStorage.getItem('guestModalDismissed')) {
      navigate('/discover?guest=1')
    } else {
      setShowGuestModal(true)
    }
  }

  const continueAsGuest = () => {
    sessionStorage.setItem('guestModalDismissed', '1')
    setShowGuestModal(false)
    navigate('/discover?guest=1')
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Cinematic backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 z-bg"
        style={{
          background:
            'radial-gradient(ellipse at center, #1a0010 0%, #0a0a0a 70%), radial-gradient(ellipse at top right, rgba(255, 75, 137, 0.15), transparent 50%), radial-gradient(ellipse at bottom left, rgba(0, 219, 233, 0.08), transparent 50%)',
        }}
      />
      {/* Cinematic overlay simulating dark alley */}
      <div
        aria-hidden
        className="absolute inset-0 z-bg"
        style={{
          background:
            'linear-gradient(180deg, rgba(10,10,10,0) 0%, rgba(10,10,10,0.4) 50%, rgba(10,10,10,0.95) 100%)',
        }}
      />

      {/* Top bar — small */}
      <header className="z-content relative px-4 py-3 flex items-center justify-between">
        <button className="w-9 h-9 flex items-center justify-center" aria-label="search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="#ff4b89" strokeWidth="2" />
            <path d="M20 20L17 17" stroke="#ff4b89" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <span className="brand-wordmark text-xl">CRITERION</span>
        <div className="w-9 h-9 flex items-center justify-center">
          <span style={{ fontSize: 16 }}>🔥</span>
        </div>
      </header>

      {/* Center content */}
      <main className="z-content relative flex-1 flex flex-col items-center justify-center px-6 pb-24 animate-fade-in">
        <h1 className="display-glow text-5xl sm:text-6xl text-center">CRITERION</h1>
        <p className="mt-3 italic text-teal-neon" style={{ fontFamily: 'Space Grotesk' }}>
          your taste, refined
        </p>

        {/* Feature pills */}
        <div className="mt-10 flex flex-wrap justify-center gap-3 max-w-md">
          <FeaturePill dotColor="#00dbe9" label="AI RECOMMENDATIONS" />
          <FeaturePill dotColor="#ff4b89" label="LIVE COMMUNITIES" />
          <FeaturePill dotColor="#ffffff" label="10,000+ FILMS" />
        </div>

        {/* CTAs */}
        <div className="mt-12 w-full max-w-sm flex flex-col gap-3">
          <button onClick={handleEnter} className="btn-primary w-full text-base animate-pulse-glow">
            Enter Criterion
          </button>
          <button onClick={handleBrowse} className="btn-secondary w-full text-base">
            Browse Reviews
          </button>
        </div>
      </main>

      {/* Guest mode modal */}
      {showGuestModal && (
        <GuestModeModal
          onContinue={continueAsGuest}
          onSignup={() => navigate('/signup')}
          onClose={() => setShowGuestModal(false)}
        />
      )}
    </div>
  )
}

function FeaturePill({ dotColor, label }) {
  return (
    <div
      className="px-4 py-2 rounded-full flex items-center gap-2 glass"
      style={{ fontSize: 11 }}
    >
      <span
        className="w-2 h-2 rounded-full"
        style={{ background: dotColor, boxShadow: `0 0 8px ${dotColor}` }}
      />
      <span className="text-text-primary tracking-widest font-semibold">{label}</span>
    </div>
  )
}

function GuestModeModal({ onContinue, onSignup, onClose }) {
  return (
    <div
      className="z-modal fixed inset-0 flex items-center justify-center p-6 animate-fade-in"
      style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="glass-strong w-full max-w-sm rounded-3xl p-6 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center"
          style={{
            background: 'rgba(255, 75, 137, 0.15)',
            border: '1px solid rgba(255, 75, 137, 0.4)',
          }}
        >
          <span className="text-2xl">⚠</span>
        </div>
        <h2
          className="text-xl font-bold text-center mb-2"
          style={{ fontFamily: 'Space Grotesk', color: '#ffffff' }}
        >
          You're in Guest Mode
        </h2>
        <p className="text-center text-text-secondary text-sm mb-4">
          Browse films and read reviews freely. Sign up to unlock:
        </p>

        <ul className="space-y-2 mb-6">
          {[
            'Communities & discussions',
            'Real-time chat rooms',
            'AI-powered recommendations',
            'Personal watchlist',
            'Daily streak & rewards',
          ].map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-text-primary">
              <span className="text-pink-neon">✕</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-2">
          <button onClick={onSignup} className="btn-primary w-full text-sm">
            Create Account
          </button>
          <button
            onClick={onContinue}
            className="text-text-secondary text-sm py-2 hover:text-text-primary transition"
          >
            Continue Browsing
          </button>
        </div>
      </div>
    </div>
  )
}
