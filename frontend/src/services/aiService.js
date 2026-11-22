import api from './api'

export async function generateStrategy(loanId, notes) {
  const { data } = await api.post('/ai/strategy', { loan_id: loanId, notes })
  return data
}

export async function generateLetter(loanIdOrParams, offerAmount, tone) {
  let payload = {}
  if (typeof loanIdOrParams === 'object' && loanIdOrParams !== null) {
    payload = {
      loan_id: loanIdOrParams.loanId,
      offer_amount: loanIdOrParams.offerAmount,
      tone: loanIdOrParams.tone,
      borrower_name: loanIdOrParams.borrowerName,
      borrower_address: loanIdOrParams.borrowerAddress,
      lender_name: loanIdOrParams.lenderName,
      lender_address: loanIdOrParams.lenderAddress,
      hardship_reason: loanIdOrParams.hardshipReason,
    }
  } else {
    payload = {
      loan_id: loanIdOrParams,
      offer_amount: offerAmount,
      tone,
    }
  }
  const { data } = await api.post('/ai/letter', payload)
  return data
}

export async function generateAdvice() {
  const { data } = await api.post('/ai/advice')
  return data
}
