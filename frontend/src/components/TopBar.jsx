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
            <span style={{ fontSize: 14 }}>🔥</span>
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
