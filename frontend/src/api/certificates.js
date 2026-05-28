import client from './client'

export const certificatesApi = {
  byStudent: (studentId) => client.get(`/certificates/student/${studentId}`).then(r => r.data),
  byRegistration: (regId) => client.get(`/certificates/registration/${regId}`).then(r => r.data),
  byNumber: (certNumber) => client.get(`/certificates/number/${certNumber}`).then(r => r.data),
  downloadUrl: (id) => `/api/certificates/${id}/pdf`,
}
