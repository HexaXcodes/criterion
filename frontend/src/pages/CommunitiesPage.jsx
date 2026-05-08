import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { communitiesApi } from '../api/communities'
import { useAuth } from '../context/AuthContext'
import GenreBackground from '../components/GenreBackground'
import TopBar from '../components/TopBar'
import BottomNav from '../components/BottomNav'

export default function CommunitiesPage() {
  const navigate = useNavigate()
  const { showToast } = useAuth()
  const [communities, setCommunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  const load = () => {
    setLoading(true)
    communitiesApi
      .getAll()
      .then(setCommunities)
      .catch(() => showToast('Could not load clubs', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="min-h-screen relative pb-28">
      <GenreBackground />

      <TopBar />

      <main className="z-content relative px-4 pt-2">
        <div className="mb-5">
          <p className="text-xs font-bold tracking-widest text-pink-neon uppercase mb-1">
            Active Realms
          </p>
          <div className="flex items-center justify-between">
            <h1 className="display-glow text-3xl">Clubs</h1>
            <span className="text-text-secondary text-xs italic">
              {communities.length} active tonight
            </span>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton w-full h-32 rounded-2xl" />
            ))}
          </div>
        ) : communities.length === 0 ? (
          <EmptyState onCreate={() => setShowCreate(true)} />
        ) : (
          <div className="space-y-3">
            {communities.map((c) => (
              <CommunityCard key={c._id} community={c} navigate={navigate} />
            ))}
          </div>
        )}

        {/* Create FAB */}
        <button
          onClick={() => setShowCreate(true)}
          className="fixed bottom-24 right-5 w-14 h-14 rounded-full flex items-center justify-center btn-primary z-content"
          style={{ padding: 0 }}
          aria-label="Create club"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="3">
            <path d="M12 5V19M5 12H19" strokeLinecap="round" />
          </svg>
        </button>
      </main>

      {showCreate && <CreateCommunityModal onClose={() => setShowCreate(false)} onCreated={load} />}

      <BottomNav />
    </div>
  )
}

function CommunityCard({ community, navigate }) {
  const genre = community.genre || 'Drama'
  const genreColors = {
    'Sci-Fi': { from: '#00131a', accent: '#00dbe9' },
    Horror: { from: '#1a0000', accent: '#ff4444' },
    Thriller: { from: '#0d0d1a', accent: '#9080d0' },
    Drama: { from: '#0a0a14', accent: '#a890c0' },
    Action: { from: '#1a0d00', accent: '#ff8c40' },
    Romance: { from: '#1a0010', accent: '#ff4b89' },
    Comedy: { from: '#0d1a00', accent: '#a8dd60' },
  }
  const c = genreColors[genre] || genreColors.Drama

  return (
    <button
      onClick={() => navigate(`/communities/${community._id}`)}
      className="w-full text-left rounded-2xl p-5 relative overflow-hidden glass active:scale-98 transition"
      style={{
        background: `linear-gradient(135deg, ${c.from} 0%, rgba(20, 20, 20, 0.8) 100%)`,
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="chip-genre" style={{ background: `${c.accent}25`, borderColor: `${c.accent}66`, color: c.accent }}>
          {genre}
        </span>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: `${c.accent}15` }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c.accent} strokeWidth="2">
            <path d="M12 2L20 8V21H4V8L12 2Z" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <h3 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'Space Grotesk' }}>
        {community.name}
      </h3>
      <p className="text-text-secondary text-sm mb-3 line-clamp-1">{community.description}</p>
      <div className="flex items-center gap-2 text-xs">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
          <circle cx="9" cy="7" r="3" />
          <path d="M3 21V19C3 16 5 14 8 14H10C13 14 15 16 15 19V21M15 11C16.5 11 18 12.5 18 14M21 21V19C21 17 19.5 15 18 15" strokeLinecap="round" />
        </svg>
        <span className="text-text-secondary font-bold">
          {(community.memberCount || 0).toLocaleString()} members
        </span>
      </div>
    </button>
  )
}

function CreateCommunityModal({ onClose, onCreated }) {
  const { showToast } = useAuth()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [genre, setGenre] = useState('Drama')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await communitiesApi.create({ name, description, genre, isPrivate: false, rules: [] })
      showToast('Club created', 'success')
      onCreated?.()
      onClose()
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not create', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="z-modal fixed inset-0 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="glass-strong w-full max-w-md rounded-3xl p-6 animate-slide-up"
      >
        <h2 className="display-glow text-2xl mb-4">Create a Club</h2>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Club name"
          className="input-glass mb-3"
        />
        <textarea
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What's your club about?"
          rows={3}
          className="input-glass mb-3 resize-none"
        />
        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="input-glass mb-4"
        >
          {['Drama', 'Sci-Fi', 'Horror', 'Thriller', 'Action', 'Romance', 'Comedy', 'Animation'].map((g) => (
            <option key={g} value={g} style={{ background: '#1a1a1a' }}>
              {g}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1 text-sm">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn-primary flex-1 text-sm disabled:opacity-50">
            {submitting ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  )
}

function EmptyState({ onCreate }) {
  return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4">🎭</div>
      <h2 className="display-glow text-xl mb-2">No clubs yet</h2>
      <p className="text-text-secondary text-sm mb-6">Be the first to start one</p>
      <button onClick={onCreate} className="btn-primary text-sm">
        Create Club
      </button>
    </div>
  )
}
