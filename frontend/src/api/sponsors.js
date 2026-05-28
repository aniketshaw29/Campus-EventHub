import client from './client'

export const sponsorsApi = {
  list: () => client.get('/sponsors').then(r => r.data),
  byEvent: (eventId) => client.get(`/sponsors/event/${eventId}`).then(r => r.data),
  create: (data) => client.post('/sponsors', data).then(r => r.data),
  link: (sponsorId, eventId, data) =>
    client.post(`/sponsors/${sponsorId}/events/${eventId}`, data).then(r => r.data),
}
