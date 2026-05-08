import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../api/auth'
import { usersApi } from '../api/users'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)
  const [toasts, setToasts] = useState([])

  // Hydrate user on app load
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      usersApi
        .getProfile()
        .then((profile) => setUser(profile))
        .catch(() => {
          localStorage.removeItem('token')
          setToken(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const showToast = useCallback((message, variant = 'info', duration = 3500) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, variant }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }, [])

  const login = useCallback(
    async (email, password) => {
      const data = await authApi.login({ email, password })
      localStorage.setItem('token', data.token)
      setToken(data.token)
      setUser(data.user)

      // Show streak toast if available
      if (data.streakMessage) {
        showToast(data.streakMessage, 'success', 4500)
      }

      // Show watchlist auto-add toast
      if (data.addedToWatchlist?.length > 0) {
        setTimeout(() => {
          showToast(
            `🎬 Added ${data.addedToWatchlist.length} films to your watchlist`,
            'info',
            4000
          )
        }, 800)
      }

      return data
    },
    [showToast]
  )

  const signup = useCallback(async (name, email, password) => {
    const data = await authApi.signup({ name, email, password })
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('criterionPet')
    localStorage.removeItem('criterionPetName')
    setToken(null)
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const profile = await usersApi.getProfile()
      setUser(profile)
      return profile
    } catch (err) {
      return null
    }
  }, [])

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    login,
    signup,
    logout,
    refreshUser,
    setUser,
    toasts,
    showToast,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
