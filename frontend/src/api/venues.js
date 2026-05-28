import client from './client'

export const venuesApi = {
  list: () => client.get('/venues').then(r => r.data),
  get: (id) => client.get(`/venues/${id}`).then(r => r.data),
  create: (data) => client.post('/venues', data).then(r => r.data),
  book: (id, data) => client.post(`/venues/${id}/book`, data).then(r => r.data),
  forEvent: (eventId) => client.get(`/venues/event/${eventId}`).then(r => r.data),
}
