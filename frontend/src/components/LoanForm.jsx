import { useState } from 'react'

const LOAN_TYPES = ['Credit Card', 'Personal Loan', 'Auto Loan', 'Home Loan', 'Student Loan', 'Medical Debt', 'Other']

export default function LoanForm({ initial, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState({
    loan_type: initial?.loan_type || LOAN_TYPES[0],
    loan_amount: initial?.loan_amount ?? '',
    outstanding_amount: initial?.outstanding_amount ?? '',
    interest_rate: initial?.interest_rate ?? '',
    due_date: initial?.due_date ? initial.due_date.slice(0, 10) : '',
  })
  const [error, setError] = useState('')

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!form.loan_amount || !form.outstanding_amount || !form.interest_rate) {
      setError('Please fill in all required fields.')
      return
    }
    onSubmit({
      loan_type: form.loan_type,
      loan_amount: parseFloat(form.loan_amount),
      outstanding_amount: parseFloat(form.outstanding_amount),
      interest_rate: parseFloat(form.interest_rate),
      due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="text-sm text-coral bg-coral/10 border border-coral/30 rounded-lg px-3 py-2">{error}</p>
      )}

      <div>
        <label className="label-text block mb-1.5">Loan type</label>
        <select value={form.loan_type} onChange={handleChange('loan_type')} className="input-field">
          {LOAN_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label-text block mb-1.5">Original amount (₹)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.loan_amount}
            onChange={handleChange('loan_amount')}
            className="input-field"
            placeholder="150000"
          />
        </div>
        <div>
          <label className="label-text block mb-1.5">Outstanding (₹)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.outstanding_amount}
            onChange={handleChange('outstanding_amount')}
            className="input-field"
            placeholder="120000"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label-text block mb-1.5">Interest rate (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={form.interest_rate}
            onChange={handleChange('interest_rate')}
            className="input-field"
            placeholder="18.5"
          />
        </div>
        <div>
          <label className="label-text block mb-1.5">Due date</label>
          <input
            type="date"
            value={form.due_date}
            onChange={handleChange('due_date')}
            className="input-field"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={submitting} className="btn-primary flex-1">
          {submitting ? 'Saving…' : initial ? 'Save changes' : 'Add loan'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">
          Cancel
        </button>
      </div>
    </form>
  )
}
