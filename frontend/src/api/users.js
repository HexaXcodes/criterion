import api from './client'

export const usersApi = {
  getProfile: () => api.get('/users/profile').then((r) => r.data),
  updatePreferences: (data) => api.put('/users/preferences', data).then((r) => r.data),
  markWatched: (movieId) => api.post('/users/watched', { movieId }).then((r) => r.data),
  addToWatchlist: (movieId) => api.post('/users/watchlist', { movieId }).then((r) => r.data),
  getStreak: () => api.get('/users/streak').then((r) => r.data),
  getLeaderboard: () => api.get('/users/leaderboard').then((r) => r.data),
  updateAccount: (data) => api.put('/users/account', data).then((r) => r.data),
}
