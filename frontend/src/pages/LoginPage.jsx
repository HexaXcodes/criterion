import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login, showToast } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/feed')
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed'
      setError(message)
      showToast(message, 'error')
    } finally {
      setLoading(false)
    }
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

      <header className="z-content px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-text-secondary text-sm">← Back</Link>
        <Link to="/" className="brand-wordmark text-lg">CRITERION</Link>
        <div className="w-12" />
      </header>

      <main className="z-content flex-1 flex flex-col justify-center px-6 max-w-md w-full mx-auto animate-fade-in">
        <h1 className="display-glow text-3xl mb-2">Welcome back</h1>
        <p className="text-text-secondary text-sm mb-8">Sign in to continue your discovery</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary tracking-widest mb-2 uppercase">
              Email
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input-glass"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary tracking-widest mb-2 uppercase">
              Password
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-glass"
            />
          </div>

          {error && (
            <div className="text-pink-neon text-sm p-3 rounded-xl bg-pink-neon/10 border border-pink-neon/30">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-base mt-2 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-text-muted">
          New to Criterion?{' '}
          <Link to="/signup" className="text-pink-neon font-semibold">
            Create account
          </Link>
        </p>
      </main>
    </div>
  )
}
