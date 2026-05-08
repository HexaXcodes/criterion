import api from './client'

export const communitiesApi = {
  getAll: () => api.get('/communities').then((r) => r.data),
  getById: (id) => api.get(`/communities/${id}`).then((r) => r.data),
  create: (data) => api.post('/communities', data).then((r) => r.data),
  join: (id) => api.post(`/communities/${id}/join`).then((r) => r.data),
  leave: (id) => api.post(`/communities/${id}/leave`).then((r) => r.data),

  // Posts
  getPosts: (communityId) =>
    api.get(`/communities/${communityId}/posts`).then((r) => r.data),
  createPost: (communityId, data) =>
    api.post(`/communities/${communityId}/posts`, data).then((r) => r.data),
  upvotePost: (communityId, postId) =>
    api.post(`/communities/${communityId}/posts/${postId}/upvote`).then((r) => r.data),

  // Comments
  getComments: (communityId, postId) =>
    api
      .get(`/communities/${communityId}/posts/${postId}/comments`)
      .then((r) => r.data),
  addComment: (communityId, postId, content) =>
    api
      .post(`/communities/${communityId}/posts/${postId}/comments`, { content })
      .then((r) => r.data),
  upvoteComment: (communityId, postId, commentId) =>
    api
      .post(`/communities/${communityId}/posts/${postId}/comments/${commentId}/upvote`)
      .then((r) => r.data),

  // Admin
  promoteAdmin: (communityId, userId) =>
    api.post(`/communities/${communityId}/promote`, { userId }).then((r) => r.data),
  removeMember: (communityId, userId) =>
    api.post(`/communities/${communityId}/remove-member`, { userId }).then((r) => r.data),
  updateRules: (communityId, rules) =>
    api.put(`/communities/${communityId}/rules`, { rules }).then((r) => r.data),
}
