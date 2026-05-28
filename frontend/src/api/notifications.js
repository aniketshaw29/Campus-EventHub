import client from './client'

export const notificationsApi = {
  byStudent: (studentId) => client.get(`/notifications/student/${studentId}`).then(r => r.data),
}
