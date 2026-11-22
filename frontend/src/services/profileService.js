import api from './api'

export async function fetchProfile() {
  const { data } = await api.get('/financial-profile')
  return data
}

export async function createProfile(payload) {
  const { data } = await api.post('/financial-profile', payload)
  return data
}

export async function updateProfile(payload) {
  const { data } = await api.put('/financial-profile', payload)
  return data
}
