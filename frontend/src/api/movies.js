import api from './client'

export const moviesApi = {
  getAll: () => api.get('/movies').then((r) => r.data),
  getById: (id) => api.get(`/movies/${id}`).then((r) => r.data),
  search: (query, genre) => {
    const params = {}
    if (query) params.query = query
    if (genre && genre !== 'All') params.genre = genre
    return api.get('/movies/search', { params }).then((r) => r.data)
  },
  getRecommendations: () => api.get('/movies/recommendations').then((r) => r.data),
  getRecommendationsExplained: () =>
    api.get('/movies/recommendations/explained').then((r) => r.data),
}
