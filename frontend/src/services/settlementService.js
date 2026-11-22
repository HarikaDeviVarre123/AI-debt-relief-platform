import api from './api'

export async function fetchSettlements() {
  const { data } = await api.get('/settlement')
  return data
}

export async function predictSettlement(loanId) {
  const { data } = await api.post('/settlement/predict', { loan_id: loanId })
  return data
}
