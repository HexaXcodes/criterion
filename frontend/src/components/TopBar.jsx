import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function TopBar({ showStreak = true, showSearch = true }) {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="z-content sticky top-0 px-4 py-3 backdrop-blur-md bg-black/30 border-b border-white/5">
      <div className="flex items-center justify-between">
        {/* Left: search */}
        <button
          onClick={() => navigate('/discover')}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/5 transition"
          aria-label="search"
        >
          {showSearch ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="#ff4b89" strokeWidth="2" />
              <path d="M20 20L17 17" stroke="#ff4b89" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : null}
        </button>

        {/* Center: brand */}
        <Link to={isAuthenticated ? '/feed' : '/'} className="brand-wordmark text-xl tracking-widest">
          CRITERION
        </Link>

        {/* Right: streak or flame */}
        {showStreak && isAuthenticated && user?.streak ? (
          <div className="glass px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-pink-neon/30">
            <span style={{ fontSize: 14 }}>🔥</span>
            <span className="text-pink-neon text-sm font-semibold">
              {user.streak.count || 0}
            </span>
          </div>
        ) : (
          <div className="w-9 h-9 rounded-full flex items-center justify-center">
            <span style={{ fontSize: 16 }}>🔥</span>
          </div>
        )}
      </div>
    </header>
  )
}
