import axios from 'axios'

const BASE = '/api'

const client = axios.create({ baseURL: BASE })

// Unwrap data automatically; re-throw with a user-friendly message
client.interceptors.response.use(
  (r) => r,
  (err) => {
    const msg =
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      'An unexpected error occurred'
    return Promise.reject(new Error(msg))
  }
)

export default client
