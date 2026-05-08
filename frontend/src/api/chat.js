import api from './client'

export const chatApi = {
  getRooms: (communityId) =>
    api.get(`/communities/${communityId}/chatrooms`).then((r) => r.data),
  createRoom: (communityId, data) =>
    api.post(`/communities/${communityId}/chatrooms`, data).then((r) => r.data),
  getMessages: (communityId, roomId) =>
    api
      .get(`/communities/${communityId}/chatrooms/${roomId}/messages`)
      .then((r) => r.data),
}
