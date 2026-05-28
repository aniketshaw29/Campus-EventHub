import client from './client'

export const leaderboardApi = {
  byEvent: (eventId) => client.get(`/leaderboard/event/${eventId}`).then(r => r.data),
  top: (limit = 10) => client.get(`/leaderboard/top?limit=${limit}`).then(r => r.data),
  byStudent: (studentId) => client.get(`/leaderboard/student/${studentId}`).then(r => r.data),
  publish: (data) => client.post('/leaderboard/results', data).then(r => r.data),
}
