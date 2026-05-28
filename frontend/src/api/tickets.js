import client from './client'

export const ticketsApi = {
  byRegistration: (registrationId) =>
    client.get(`/tickets/registration/${registrationId}`).then(r => r.data),
  validate: (id) => client.get(`/tickets/${id}/validate`).then(r => r.data),
  markUsed: (id) => client.put(`/tickets/${id}/mark-used`).then(r => r.data),
}
