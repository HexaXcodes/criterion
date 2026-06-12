import api from './client'

export const moviesApi = {
  getAll: (params = {}) => api.get('/movies', { params }).then((r) => r.data),
  getById: (id) => api.get(`/movies/${id}`).then((r) => r.data),
  search: (query, genre, page = 1, limit = 40, sort = 'rating', langs = [], lang = 'all') => {
    const params = { page, limit, sort }
    if (query) params.query = query
    if (genre && genre !== 'All') params.genre = genre
    if (langs.length > 0) params.langs = langs.join(',')
    if (lang && lang !== 'all') params.lang = lang
    return api.get('/movies/search', { params }).then((r) => r.data)
  },
  getRecommendations: () => api.get('/movies/recommendations').then((r) => r.data),
  getRecommendationsExplained: (excludeIds = []) => {
    const params = excludeIds.length ? { exclude: excludeIds.join(',') } : {}
    return api.get('/movies/recommendations/explained', { params }).then((r) => r.data)
  },
  getRecommendationHealth: () => api.get('/movies/recommendations/health').then((r) => r.data),
  getGenreSections: (limit = 10, langs = []) => {
    const params = { limit }
    if (langs.length > 0) params.langs = langs.join(',')
    return api.get('/movies/genre-sections', { params }).then((r) => r.data)
  },
  getTrailer: (id) => api.get(`/movies/${id}/trailer`).then((r) => r.data),
}
