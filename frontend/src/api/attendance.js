import client from './client'

export const attendanceApi = {
  mark: (data) => client.post('/attendance', data).then(r => r.data),
  byEvent: (eventId) => client.get(`/attendance/event/${eventId}`).then(r => r.data),
  byStudent: (studentId) => client.get(`/attendance/student/${studentId}`).then(r => r.data),
  status: (registrationId) => client.get(`/attendance/${registrationId}/status`).then(r => r.data),
}
