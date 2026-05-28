import client from './client'

export const announcementsApi = {
  list: () => client.get('/announcements').then(r => r.data),
  byEvent: (eventId) => client.get(`/announcements/event/${eventId}`).then(r => r.data),
  create: (data) => client.post('/announcements', data).then(r => r.data),
}
