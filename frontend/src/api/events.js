import client from './client'

export const eventsApi = {
  list: () => client.get('/events').then(r => r.data),
  get: (id) => client.get(`/events/${id}`).then(r => r.data),
  listByStatus: (status) => client.get(`/events/status/${status}`).then(r => r.data),
  create: (data) => client.post('/events', data).then(r => r.data),
  update: (id, data) => client.put(`/events/${id}`, data).then(r => r.data),
  delete: (id) => client.delete(`/events/${id}`),
}
