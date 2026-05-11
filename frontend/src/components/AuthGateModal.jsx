import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthGateModal() {
  const { authGate, hideAuthGate } = useAuth()
  const navigate = useNavigate()

  if (!authGate) return null

  const handleLogin = () => {
    hideAuthGate()
    navigate('/login')
  }

  return (
    <div
      onClick={hideAuthGate}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '360px',
          borderRadius: '24px',
          background: '#111',
          border: '1px solid rgba(255,75,137,0.25)',
          boxShadow: '0 0 60px rgba(0,0,0,0.8)',
          padding: '32px 24px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        {/* Icon */}
        <div style={{
          width: 52, height: 52,
          borderRadius: '50%',
          background: 'rgba(255,75,137,0.12)',
          border: '1px solid rgba(255,75,137,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 8,
          fontSize: 22,
        }}>
          🔒
        </div>

        {/* Label */}
        <div style={{
          fontFamily: 'Space Grotesk',
          fontWeight: 700,
          fontStyle: 'italic',
          fontSize: 10,
          letterSpacing: '0.1em',
          background: 'linear-gradient(135deg,#ff4b89,#ff6b9d)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: 2,
        }}>
          SIGN IN REQUIRED
        </div>

        <h2 style={{
          fontFamily: 'Space Grotesk',
          fontWeight: 700,
          fontSize: 18,
          color: '#e2e2e2',
          textAlign: 'center',
          marginBottom: 4,
        }}>
          Create an account to {authGate.action}
        </h2>

        <p style={{
          fontFamily: 'Space Grotesk',
          fontSize: 13,
          color: '#777',
          textAlign: 'center',
          lineHeight: 1.5,
          marginBottom: 20,
        }}>
          Join Criterion to unlock your full cinematic experience — watchlists, reviews, recommendations, and more.
        </p>

        {/* Login button */}
        <button
          onClick={handleLogin}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg,#ff4b89,#ff2070)',
            border: 'none',
            color: '#fff',
            fontFamily: 'Space Grotesk',
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
            marginBottom: 8,
          }}
        >
          Go to Login
        </button>

        {/* Continue as guest */}
        <button
          onClick={hideAuthGate}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '14px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#9a9a9a',
            fontFamily: 'Space Grotesk',
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          Continue as Guest
        </button>
      </div>
    </div>
  )
}
