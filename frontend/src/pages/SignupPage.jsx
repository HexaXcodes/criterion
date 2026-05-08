import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usePet } from '../context/PetContext'
import { usersApi } from '../api/users'
import { GENRES } from '../utils/helpers'
import MimiPet from '../components/pets/MimiPet'
import JeebiePet from '../components/pets/JeebiePet'
import ToffeePet from '../components/pets/ToffeePet'
import BiscuitPet from '../components/pets/BiscuitPet'

const COMPANIONS = [
  { id: 'mimi', name: 'Mimi', tag: 'DREAMER', component: MimiPet, color: '#ff4b89' },
  { id: 'jeebie', name: 'Jeebie', tag: 'CHAOTIC', component: JeebiePet, color: '#ff8c40' },
  { id: 'toffee', name: 'Toffee', tag: 'SOPHISTICATED', component: ToffeePet, color: '#4aaa60' },
  { id: 'biscuit', name: 'Biscuit', tag: 'LOYAL', component: BiscuitPet, color: '#ffaa44' },
]

export default function SignupPage() {
  const { signup, login, showToast } = useAuth()
  const { setPetType, setPetName } = usePet()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Step 1
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Step 2
  const [genres, setGenres] = useState([])

  // Step 3
  const [selectedPet, setSelectedPet] = useState('mimi')
  const [petCustomName, setPetCustomName] = useState('')

  const handleStep1 = async (e) => {
    e.preventDefault()
    if (!name || !email || password.length < 6) {
      showToast('Please fill all fields. Password must be 6+ chars', 'error')
      return
    }
    setLoading(true)
    try {
      await signup(name, email, password)
      // Auto login
      await login(email, password)
      setStep(2)
    } catch (err) {
      showToast(err.response?.data?.message || 'Signup failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const toggleGenre = (g) => {
    setGenres((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]))
  }

  const handleStep2 = async () => {
    if (genres.length === 0) {
      showToast('Pick at least one genre', 'error')
      return
    }
    setLoading(true)
    try {
      await usersApi.updatePreferences({ genres, favoriteActors: [] })
      setStep(3)
    } catch (err) {
      showToast('Could not save preferences', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleFinish = () => {
    setPetType(selectedPet)
    if (petCustomName.trim()) {
      setPetName(petCustomName.trim())
    }
    showToast(`Welcome to Criterion!`, 'success', 3000)
    navigate('/feed')
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg-deep">
      <div
        aria-hidden
        className="fixed inset-0 z-bg"
        style={{
          background:
            'radial-gradient(ellipse at top, rgba(255, 75, 137, 0.1) 0%, transparent 50%), #0a0a0a',
        }}
      />

      {/* Top bar with progress */}
      <header className="z-content px-4 py-4 flex items-center justify-between">
        <span className="brand-wordmark text-lg">CRITERION</span>
        <ProgressDots step={step} />
        <Link to="/" className="text-text-muted text-xl">×</Link>
      </header>

      <main className="z-content flex-1 px-6 pb-12 max-w-md w-full mx-auto animate-fade-in">
        {step === 1 && (
          <Step1
            name={name}
            email={email}
            password={password}
            setName={setName}
            setEmail={setEmail}
            setPassword={setPassword}
            onSubmit={handleStep1}
            loading={loading}
          />
        )}

        {step === 2 && (
          <Step2 genres={genres} toggleGenre={toggleGenre} onNext={handleStep2} loading={loading} />
        )}

        {step === 3 && (
          <Step3
            selectedPet={selectedPet}
            setSelectedPet={setSelectedPet}
            petCustomName={petCustomName}
            setPetCustomName={setPetCustomName}
            onFinish={handleFinish}
          />
        )}
      </main>
    </div>
  )
}

function ProgressDots({ step }) {
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className="rounded-full transition-all"
          style={{
            width: step === n ? 24 : 8,
            height: 8,
            background: step >= n ? '#ff4b89' : 'rgba(255, 75, 137, 0.2)',
          }}
        />
      ))}
    </div>
  )
}

function Step1({ name, email, password, setName, setEmail, setPassword, onSubmit, loading }) {
  return (
    <>
      <h1 className="display-glow text-3xl mb-2 mt-4">Create account</h1>
      <p className="text-text-secondary text-sm mb-8">Step 1 of 3 — your details</p>

      <form onSubmit={onSubmit} className="space-y-4">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="input-glass"
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="input-glass"
        />
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (min 6 chars)"
          className="input-glass"
        />
        <button type="submit" disabled={loading} className="btn-primary w-full text-base mt-4 disabled:opacity-50">
          {loading ? 'Creating...' : 'Continue'}
        </button>
      </form>

      <p className="text-center mt-6 text-sm text-text-muted">
        Already have an account?{' '}
        <Link to="/login" className="text-pink-neon font-semibold">
          Sign in
        </Link>
      </p>
    </>
  )
}

function Step2({ genres, toggleGenre, onNext, loading }) {
  return (
    <>
      <h1 className="display-glow text-3xl mb-2 mt-4">What do you love watching?</h1>
      <p className="text-text-secondary text-sm mb-8">Step 2 of 3 — pick your genres</p>

      <div className="flex flex-wrap gap-2 mb-8">
        {GENRES.map((g) => (
          <button
            key={g}
            onClick={() => toggleGenre(g)}
            className={`chip-genre transition ${genres.includes(g) ? 'active' : ''}`}
            style={{ fontSize: 12 }}
          >
            {g}
          </button>
        ))}
      </div>

      <button onClick={onNext} disabled={loading} className="btn-primary w-full text-base disabled:opacity-50">
        {loading ? 'Saving...' : `Continue (${genres.length} selected)`}
      </button>
    </>
  )
}

function Step3({ selectedPet, setSelectedPet, petCustomName, setPetCustomName, onFinish }) {
  return (
    <>
      <h1 className="display-glow text-3xl mb-2 mt-4">Pick your Criterion companion</h1>
      <p className="text-text-secondary text-sm mb-6">Step 3 of 3 — they'll follow you everywhere</p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {COMPANIONS.map((pet) => {
          const PetSvg = pet.component
          const isSelected = selectedPet === pet.id
          return (
            <button
              key={pet.id}
              onClick={() => setSelectedPet(pet.id)}
              className="rounded-2xl p-4 transition relative"
              style={{
                background: isSelected ? 'rgba(255, 75, 137, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                border: isSelected
                  ? '2px solid #ff4b89'
                  : '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: isSelected ? '0 0 30px rgba(255, 75, 137, 0.4)' : 'none',
              }}
            >
              <div className="flex justify-center mb-2">
                <PetSvg size={70} />
              </div>
              <div className="text-center">
                <div className="text-text-primary font-bold text-lg" style={{ fontFamily: 'Space Grotesk' }}>
                  {pet.name}
                </div>
                <div className="chip-pink text-[10px] inline-block mt-1">{pet.tag}</div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="mb-6">
        <label className="block text-xs font-semibold text-text-secondary tracking-widest mb-2 uppercase">
          Name your companion
        </label>
        <input
          value={petCustomName}
          onChange={(e) => setPetCustomName(e.target.value)}
          placeholder="e.g. Stardust Navigator"
          maxLength={24}
          className="input-glass"
        />
      </div>

      <button onClick={onFinish} className="btn-primary w-full text-base">
        Let's Go →
      </button>
    </>
  )
}
