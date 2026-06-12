import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function TopBar({ showStreak = true }) {
  const { isAuthenticated, user } = useAuth()

  return (
    <header className="z-content sticky top-0 px-4 py-3 backdrop-blur-md bg-black/30 border-b border-white/5">
      <div className="flex items-center justify-between">
        <div className="w-9 h-9" />

        {/* Center: brand */}
        <Link to={isAuthenticated ? '/feed' : '/'} className="brand-wordmark text-xl tracking-widest">
          CRITERION
        </Link>

        {/* Right: streak badge (only when logged in and streak exists) */}
        {showStreak && isAuthenticated && user?.streak ? (
          <div className="glass px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-pink-neon/30">
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-pink-neon animate-pulse"
              style={{ filter: "drop-shadow(0 0 4px rgba(255, 0, 128, 0.5))" }}
            >
              <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z" />
              <path d="M9.5 14.5c.5-1.5 1.5-2 1.5-3s-.5-2.2 1-3.2c1 1.2 2 2.5 1 3.7s-1.2.7-1.5 1.5c-.3.7 0 1.2.5 1.5" fill="currentColor" />
            </svg>
            <span className="text-pink-neon text-sm font-semibold">
              {user.streak.count || 0}
            </span>
          </div>
        ) : (
          <div className="w-9 h-9" />
        )}
      </div>
    </header>
  )
}
