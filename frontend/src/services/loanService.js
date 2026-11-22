import api from './api'

export async function fetchLoans() {
  const { data } = await api.get('/loans')
  return data
}

export async function createLoan(payload) {
  const { data } = await api.post('/loans', payload)
  return data
}

export async function updateLoan(loanId, payload) {
  const { data } = await api.put(`/loans/${loanId}`, payload)
  return data
}

export async function deleteLoan(loanId) {
  await api.delete(`/loans/${loanId}`)
}
