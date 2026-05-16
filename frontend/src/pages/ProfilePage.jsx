import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usersApi } from '../api/users'
import { useAuth } from '../context/AuthContext'
import { usePet } from '../context/PetContext'
import { GENRES, LANGUAGES, timeAgo } from '../utils/helpers'
import GenreBackground from '../components/GenreBackground'
import TopBar from '../components/TopBar'
import BottomNav from '../components/BottomNav'
import MimiPet from '../components/pets/MimiPet'
import JeebiePet from '../components/pets/JeebiePet'
import ToffeePet from '../components/pets/ToffeePet'
import BiscuitPet from '../components/pets/BiscuitPet'
import MochiPet from '../components/pets/MochiPet'
import PuddingPet from '../components/pets/PuddingPet'
import PepperPet from '../components/pets/PepperPet'
import CocoPet from '../components/pets/CocoPet'

const PET_COMPONENTS = {
  mimi: MimiPet,
  jeebie: JeebiePet,
  toffee: ToffeePet,
  biscuit: BiscuitPet,
  mochi: MochiPet,
  pudding: PuddingPet,
  pepper: PepperPet,
  coco: CocoPet,
}
const PET_DESCRIPTIONS = {
  mimi: 'A mysterious dreamer who watches films twice — once for the plot, once for the vibe.',
  jeebie: 'A chaotic cinephile who starts 6 movies a night and finishes maybe one.',
  toffee: 'Sophisticated. Has opinions about lens choices. Probably owns a film poster.',
  biscuit: 'Loyal and always hype. Has seen every Marvel film opening night.',
  mochi: 'Soft and quiet. Has a 5-star spreadsheet for every film they\'ve ever seen.',
  pudding: 'Dark and mysterious. Only watches films after midnight.',
  pepper: 'Snarky critic energy. Never gives more than 4 stars, on principle.',
  coco: 'Warm and enthusiastic. Cries at every film, even the bad ones.',
}

const ALL_PETS = [
  { id: 'mimi',    name: 'Mimi',    component: MimiPet,    color: '#ff4b89' },
  { id: 'jeebie',  name: 'Jeebie',  component: JeebiePet,  color: '#00dbe9' },
  { id: 'toffee',  name: 'Toffee',  component: ToffeePet,  color: '#ffb347' },
  { id: 'biscuit', name: 'Biscuit', component: BiscuitPet, color: '#ff8c69' },
  { id: 'mochi',   name: 'Mochi',   component: MochiPet,   color: '#c084fc' },
  { id: 'pudding', name: 'Pudding', component: PuddingPet, color: '#818cf8' },
  { id: 'pepper',  name: 'Pepper',  component: PepperPet,  color: '#fb7185' },
  { id: 'coco',    name: 'Coco',    component: CocoPet,    color: '#34d399' },
]

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout, showToast } = useAuth()
  const { petType, petName, setPetType, setPetName } = usePet()

  const [profile, setProfile] = useState(null)
  const [streak, setStreak] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPrefs, setShowPrefs] = useState(false)
  const [showPetPicker, setShowPetPicker] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [editPetName, setEditPetName] = useState(petName)
  const [savingName, setSavingName] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      usersApi.getProfile().then(setProfile).catch(() => null),
      usersApi.getStreak().then(setStreak).catch(() => null),
      usersApi.getLeaderboard().then(setLeaderboard).catch(() => []),
    ]).finally(() => setLoading(false))
  }, [])

  // Find user's rank in leaderboard
  const rank = leaderboard.findIndex((u) => u._id === user?._id) + 1

  const handleSavePetName = () => {
    setSavingName(true)
    setPetName(editPetName)
    setTimeout(() => {
      setSavingName(false)
      showToast('Companion name saved', 'success')
    }, 300)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const initials = (name) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  const PetSvg = PET_COMPONENTS[petType] || MimiPet
  const streakCount = streak?.count || profile?.streak?.count || 0
  const points = streak?.points || profile?.points || 0
  const milestone = Math.ceil(points / 100) * 100
  const progress = points % 100

  return (
    <div className="min-h-screen relative pb-28">
      <GenreBackground />
      <TopBar />

      <main className="z-content relative px-4 pt-4 max-w-md mx-auto">
        {loading ? (
          <ProfileSkeleton />
        ) : (
          <>
            {/* Avatar + name */}
            <div className="flex flex-col items-center text-center mb-6 animate-fade-in">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mb-3"
                style={{
                  background: 'linear-gradient(135deg, #ff4b89, #ff6b9d)',
                  color: '#0a0a0a',
                  fontFamily: 'Space Grotesk',
                  boxShadow: '0 0 40px rgba(255, 75, 137, 0.4)',
                }}
              >
                {initials(profile?.name || user?.name)}
              </div>
              <h1 className="display-glow text-2xl">{profile?.name || user?.name}</h1>
              <p className="text-text-muted text-sm mt-1">{profile?.email || user?.email}</p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: 'Watchlist', value: profile?.watchlist?.length ?? 0 },
                { label: 'Watched', value: profile?.watchedMovies?.length ?? 0 },
                { label: 'Reviews', value: profile?.reviewCount ?? 0 },
              ].map((s) => (
                <div key={s.label} className="glass rounded-2xl p-4 text-center">
                  <div className="text-pink-neon text-2xl font-bold" style={{ fontFamily: 'Space Grotesk' }}>
                    {s.value}
                  </div>
                  <div className="text-text-muted text-xs mt-1 tracking-wider uppercase">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Streak card */}
            <div className="glass-pink rounded-2xl p-5 mb-5">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255, 75, 137, 0.2)' }}
                >
                  <span className="text-xl">🔥</span>
                </div>
                <div>
                  <div className="text-text-primary font-bold" style={{ fontFamily: 'Space Grotesk' }}>
                    Cinephile Streak
                  </div>
                  <div className="text-pink-neon text-sm font-bold">
                    {streakCount} Days of Discovery
                  </div>
                </div>
                <div className="ml-auto text-2xl">🔥</div>
              </div>
              <div className="flex items-center justify-between text-xs text-text-secondary mb-2">
                <span>Next Milestone: {milestone} pts</span>
                <span className="text-pink-neon font-bold">{progress}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(progress, 100)}%`,
                    background: 'linear-gradient(90deg, #ff4b89, #ff6b9d)',
                  }}
                />
              </div>
              {rank > 0 && (
                <div className="mt-3 text-xs text-text-secondary">
                  🏆 Rank{' '}
                  <span className="text-pink-neon font-bold">#{rank}</span> on Criterion
                </div>
              )}
            </div>

            {/* My companion */}
            <div className="glass rounded-2xl p-5 mb-5">
              <h3 className="text-text-muted text-xs font-bold tracking-widest uppercase mb-4">
                My Companion
              </h3>
              <div
                className="rounded-2xl p-4 mb-4"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(0, 219, 233, 0.2)',
                  borderLeft: '3px solid #00dbe9',
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <PetSvg size={64} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-teal-neon font-bold text-lg capitalize"
                        style={{ fontFamily: 'Space Grotesk' }}
                      >
                        {petName || petType.charAt(0).toUpperCase() + petType.slice(1)}
                      </span>
                      <button
                        onClick={() => setShowPrefs(false)}
                        className="text-text-muted"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-text-secondary text-xs leading-relaxed">
                      {PET_DESCRIPTIONS[petType] || ''}
                    </p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <span className="chip-genre text-[10px]">{petType.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Name input */}
              <div className="mb-3">
                <label className="block text-xs text-text-secondary tracking-widest uppercase mb-2">
                  Companion Name
                </label>
                <div className="flex gap-2">
                  <input
                    value={editPetName}
                    onChange={(e) => setEditPetName(e.target.value)}
                    placeholder={petType.charAt(0).toUpperCase() + petType.slice(1)}
                    maxLength={24}
                    className="input-glass flex-1 text-sm"
                  />
                  <button
                    onClick={handleSavePetName}
                    disabled={savingName || editPetName === petName}
                    className="btn-primary text-xs px-4 disabled:opacity-40"
                    style={{ padding: '10px 16px' }}
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* Change companion row */}
              <button
                onClick={() => setShowPetPicker(true)}
                className="text-teal-neon text-xs font-semibold hover:underline"
              >
                Change companion →
              </button>
            </div>

            {/* Genre + language preferences */}
            <div className="glass rounded-2xl p-5 mb-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-text-muted text-xs font-bold tracking-widest uppercase">
                  Preferences
                </h3>
                <button
                  onClick={() => setShowPrefs(true)}
                  className="text-pink-neon text-xs font-semibold"
                >
                  Edit
                </button>
              </div>

              <p className="text-text-muted text-xs tracking-widest mb-2 uppercase">Genres</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {(profile?.preferences?.genres || []).length === 0 ? (
                  <span className="text-text-muted text-sm">No genres set</span>
                ) : (
                  (profile?.preferences?.genres || []).map((g) => (
                    <span key={g} className="chip-genre">{g}</span>
                  ))
                )}
              </div>

              <p className="text-text-muted text-xs tracking-widest mb-2 uppercase">Languages</p>
              <div className="flex flex-wrap gap-2">
                {(profile?.preferences?.languages || ['en']).map((code) => {
                  const lang = LANGUAGES.find((l) => l.code === code)
                  return (
                    <span
                      key={code}
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{
                        background: 'rgba(0,219,233,0.1)',
                        border: '1px solid rgba(0,219,233,0.3)',
                        color: '#00dbe9',
                        fontFamily: 'Space Grotesk',
                      }}
                    >
                      {lang?.label || code}
                    </span>
                  )
                })}
              </div>
            </div>

            {/* Settings rows */}
            <div className="space-y-2 mb-6">
              <SettingsRow
                icon="⚙️"
                label="Account Settings"
                onClick={() => setShowSettings(true)}
              />
              <SettingsRow
                icon="🕐"
                label="Viewing History"
                onClick={() => setShowHistory(true)}
              />
            </div>

            {/* Sign out */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-4 text-text-secondary hover:text-pink-neon transition text-sm font-semibold"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" />
                <polyline points="16,17 21,12 16,7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sign Out
            </button>
          </>
        )}
      </main>

      {showPrefs && (
        <EditPreferencesModal
          currentGenres={profile?.preferences?.genres || []}
          currentLanguages={profile?.preferences?.languages || ['en']}
          onClose={() => setShowPrefs(false)}
          onSaved={({ genres, languages }) => {
            setProfile((p) => ({
              ...p,
              preferences: { ...p?.preferences, genres, languages },
            }))
            setShowPrefs(false)
          }}
        />
      )}

      {showPetPicker && (
        <div
          onClick={() => setShowPetPicker(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 480, borderRadius: 24,
              background: '#111', border: '1px solid rgba(255,75,137,0.2)',
              padding: '28px 20px 20px', display: 'flex', flexDirection: 'column', gap: 16,
            }}
          >
            <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 18, color: '#fff', textAlign: 'center' }}>
              Choose your companion
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {ALL_PETS.map((pet) => {
                const PetSvg = pet.component
                const isSelected = petType === pet.id
                return (
                  <button
                    key={pet.id}
                    onClick={() => { setPetType(pet.id); setShowPetPicker(false); showToast(`Switched to ${pet.name}!`, 'success') }}
                    style={{
                      borderRadius: 16, padding: '12px 8px',
                      background: isSelected ? 'rgba(255,75,137,0.1)' : 'rgba(255,255,255,0.03)',
                      border: isSelected ? `2px solid ${pet.color}` : '1px solid rgba(255,255,255,0.08)',
                      boxShadow: isSelected ? `0 0 20px ${pet.color}55` : 'none',
                      cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                      transition: 'all 150ms ease',
                    }}
                  >
                    <PetSvg size={52} state="idle" />
                    <span style={{ fontFamily: 'Space Grotesk', fontSize: 11, fontWeight: 600, color: isSelected ? pet.color : '#9a9a9a' }}>
                      {pet.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <AccountSettingsModal user={user} onClose={() => setShowSettings(false)} />
      )}

      {showHistory && (
        <ViewingHistoryModal watched={profile?.watchedMovies || []} onClose={() => setShowHistory(false)} />
      )}

      <BottomNav />
    </div>
  )
}

function SettingsRow({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="glass w-full flex items-center gap-4 px-5 py-4 rounded-2xl hover:bg-white/5 transition active:scale-98"
    >
      <span className="text-xl">{icon}</span>
      <span className="flex-1 text-left text-text-primary font-medium">{label}</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6a6a6a" strokeWidth="2">
        <path d="M9 18L15 12L9 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

function EditPreferencesModal({ currentGenres, currentLanguages, onClose, onSaved }) {
  const { showToast } = useAuth()
  const [selectedGenres, setSelectedGenres] = useState([...currentGenres])
  const [selectedLangs, setSelectedLangs] = useState([...(currentLanguages || ['en'])])
  const [saving, setSaving] = useState(false)

  const toggleGenre = (g) =>
    setSelectedGenres((s) => (s.includes(g) ? s.filter((x) => x !== g) : [...s, g]))

  const toggleLang = (code) =>
    setSelectedLangs((s) =>
      s.includes(code) ? (s.length > 1 ? s.filter((x) => x !== code) : s) : [...s, code]
    )

  const handleSave = async () => {
    if (selectedGenres.length === 0) {
      showToast('Pick at least one genre', 'error')
      return
    }
    setSaving(true)
    try {
      await usersApi.updatePreferences({ genres: selectedGenres, languages: selectedLangs, favoriteActors: [] })
      showToast('Preferences saved', 'success')
      onSaved({ genres: selectedGenres, languages: selectedLangs })
    } catch (err) {
      showToast('Could not save', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="z-modal fixed inset-0 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-strong w-full max-w-md rounded-3xl p-6 animate-slide-up"
        style={{ maxHeight: '85vh', overflowY: 'auto' }}
      >
        <h2 className="display-glow text-2xl mb-2">Edit Preferences</h2>

        <p className="text-text-muted text-xs tracking-widest font-bold mb-2 mt-4 uppercase">Genres</p>
        <div className="flex flex-wrap gap-2 mb-5">
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => toggleGenre(g)}
              className={`chip-genre transition ${selectedGenres.includes(g) ? 'active' : ''}`}
            >
              {g}
            </button>
          ))}
        </div>

        <p className="text-text-muted text-xs tracking-widest font-bold mb-2 uppercase">Preferred Languages</p>
        <p className="text-text-muted text-xs mb-3">Films in these languages appear first. Keep at least one.</p>
        <div className="flex flex-wrap gap-2 mb-6">
          {LANGUAGES.map(({ code, label }) => {
            const active = selectedLangs.includes(code)
            return (
              <button
                key={code}
                onClick={() => toggleLang(code)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 99,
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: 'Space Grotesk',
                  cursor: 'pointer',
                  background: active ? 'rgba(0,219,233,0.15)' : 'rgba(255,255,255,0.05)',
                  border: active ? '1px solid rgba(0,219,233,0.5)' : '1px solid rgba(255,255,255,0.1)',
                  color: active ? '#00dbe9' : '#9a9a9a',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="btn-secondary flex-1 text-sm">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex-1 text-sm disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

function AccountSettingsModal({ user, onClose }) {
  const { showToast } = useAuth()
  const [displayName, setDisplayName] = useState(user?.name || '')
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!displayName.trim()) { showToast('Name cannot be empty', 'error'); return }
    setSaving(true)
    try {
      const body = { name: displayName.trim() }
      if (newPw) {
        if (!currentPw) { showToast('Enter your current password', 'error'); setSaving(false); return }
        if (newPw.length < 6) { showToast('New password must be 6+ chars', 'error'); setSaving(false); return }
        body.currentPassword = currentPw
        body.newPassword = newPw
      }
      await usersApi.updateAccount(body)
      showToast('Account updated', 'success')
      onClose()
    } catch (err) {
      showToast(err?.response?.data?.message || 'Could not update', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="z-modal fixed inset-0 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)' }}
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()}
        className="glass-strong w-full max-w-sm rounded-3xl p-6"
        style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 20, color: '#fff', margin: 0 }}>Account Settings</h2>

        <div>
          <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#9a9a9a', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Display Name</label>
          <input className="input-glass" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={40} />
        </div>

        <div>
          <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#9a9a9a', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Email</label>
          <input className="input-glass" value={user?.email || ''} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#9a9a9a', textTransform: 'uppercase', marginBottom: 10 }}>Change Password <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input className="input-glass" type="password" placeholder="Current password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} />
            <input className="input-glass" type="password" placeholder="New password (min 6 chars)" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} className="btn-secondary flex-1 text-sm">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 text-sm disabled:opacity-50">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ViewingHistoryModal({ watched, onClose }) {
  return (
    <div className="z-modal fixed inset-0 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)' }}
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()}
        className="glass-strong w-full max-w-md rounded-3xl p-6"
        style={{ maxHeight: '80vh', display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 20, color: '#fff', margin: 0 }}>Viewing History</h2>
          <span style={{ fontSize: 12, color: '#9a9a9a' }}>{watched.length} watched</span>
        </div>

        {watched.length === 0 ? (
          <p style={{ color: '#9a9a9a', fontSize: 14, textAlign: 'center', padding: '32px 0' }}>No films marked as watched yet.</p>
        ) : (
          <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {watched.map((m) => (
              <div key={m._id} className="glass" style={{ display: 'flex', alignItems: 'center', gap: 12, borderRadius: 14, padding: '10px 12px' }}>
                {m.posterUrl
                  ? <img src={m.posterUrl} alt={m.title} style={{ width: 40, height: 58, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                  : <div style={{ width: 40, height: 58, borderRadius: 8, background: 'rgba(255,75,137,0.1)', flexShrink: 0 }} />
                }
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: 14, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.title}</div>
                  <div style={{ fontSize: 12, color: '#9a9a9a', marginTop: 2 }}>{m.genre?.slice(0, 2).join(' · ')} {m.releaseYear ? `· ${m.releaseYear}` : ''}</div>
                  <div style={{ fontSize: 12, color: '#ff4b89', marginTop: 2 }}>★ {m.averageRating?.toFixed(1)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <button onClick={onClose} className="btn-secondary w-full text-sm">Close</button>
      </div>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex flex-col items-center gap-3">
        <div className="skeleton w-20 h-20 rounded-full" />
        <div className="skeleton h-7 w-40" />
        <div className="skeleton h-4 w-48" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
      </div>
      <div className="skeleton h-28 rounded-2xl" />
      <div className="skeleton h-40 rounded-2xl" />
    </div>
  )
}
