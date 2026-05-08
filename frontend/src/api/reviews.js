import api from './client'

export const reviewsApi = {
  add: (data) => api.post('/reviews', data).then((r) => r.data),
  getByMovie: (movieId) => api.get(`/reviews/${movieId}`).then((r) => r.data),
}
