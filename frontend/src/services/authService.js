import api from './api'

export async function registerUser({ name, email, password }) {
  const { data } = await api.post('/register', { name, email, password })
  return data
}

export async function loginUser({ email, password }) {
  const { data } = await api.post('/login', { email, password })
  return data
}

export function saveSession(token, user) {
  localStorage.setItem('finrelief_token', token)
  localStorage.setItem('finrelief_user', JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem('finrelief_token')
  localStorage.removeItem('finrelief_user')
}

export function getStoredUser() {
  const raw = localStorage.getItem('finrelief_user')
  return raw ? JSON.parse(raw) : null
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem('finrelief_token'))
}
