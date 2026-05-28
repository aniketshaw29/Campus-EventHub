import client from './client'

export const registrationsApi = {
  register: (data) => client.post('/registrations', data).then(r => r.data),
  get: (id) => client.get(`/registrations/${id}`).then(r => r.data),
  byStudent: (studentId) => client.get(`/registrations/student/${studentId}`).then(r => r.data),
  byEvent: (eventId) => client.get(`/registrations/event/${eventId}`).then(r => r.data),
  cancel: (id) => client.delete(`/registrations/${id}`),
}
