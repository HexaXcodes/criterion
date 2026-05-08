import { useAuth } from '../context/AuthContext'

export default function ToastStack() {
  const { toasts } = useAuth()

  if (!toasts.length) return null

  return (
    <div
      className="z-toast"
      style={{
        position: 'fixed',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        width: 'calc(100% - 32px)',
        maxWidth: 400,
        pointerEvents: 'none',
      }}
    >
      {toasts.map((t) => (
        <Toast key={t.id} message={t.message} variant={t.variant} />
      ))}
    </div>
  )
}

function Toast({ message, variant }) {
  const styles = {
    success: 'bg-gradient-to-r from-pink-neon to-pink-glow text-bg-deep',
    info: 'bg-bg-elevated text-text-primary border border-white/10',
    error: 'bg-red-900 text-white',
  }
  return (
    <div
      className={`toast-enter ${styles[variant] || styles.info} px-4 py-3 rounded-2xl shadow-2xl text-sm font-medium`}
      style={{ pointerEvents: 'auto', backdropFilter: 'blur(16px)' }}
    >
      {message}
    </div>
  )
}
