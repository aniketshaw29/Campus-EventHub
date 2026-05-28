import client from './client'

export const feedbackApi = {
  submit: (data) => client.post('/feedback', data).then(r => r.data),
  byEvent: (eventId) => client.get(`/feedback/event/${eventId}`).then(r => r.data),
  summary: (eventId) => client.get(`/feedback/event/${eventId}/summary`).then(r => r.data),
  byStudent: (studentId) => client.get(`/feedback/student/${studentId}`).then(r => r.data),
}
