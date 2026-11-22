import { useEffect, useState } from 'react'
import AppLayout from '../components/AppLayout'
import Modal from '../components/Modal'
import LoanForm from '../components/LoanForm'
import { fetchLoans, createLoan, updateLoan, deleteLoan } from '../services/loanService'
import { useToast } from '../components/Toast'

export default function Loans() {
  const { showToast } = useToast()
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingLoan, setEditingLoan] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const load = () => {
    setLoading(true)
    fetchLoans()
      .then(setLoans)
      .catch(() => showToast('Could not load loans.', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openCreate = () => {
    setEditingLoan(null)
    setModalOpen(true)
  }

  const openEdit = (loan) => {
    setEditingLoan(loan)
    setModalOpen(true)
  }

  const handleSubmit = async (payload) => {
    setSubmitting(true)
    try {
      if (editingLoan) {
        await updateLoan(editingLoan.loan_id, payload)
        showToast('Loan updated.', 'success')
      } else {
        await createLoan(payload)
        showToast('Loan added.', 'success')
      }
      setModalOpen(false)
      load()
    } catch (err) {
      showToast(err.response?.data?.detail || 'Something went wrong.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (loanId) => {
    if (!confirm('Delete this loan? This cannot be undone.')) return
    setDeletingId(loanId)
    try {
      await deleteLoan(loanId)
      showToast('Loan deleted.', 'success')
      load()
    } catch {
      showToast('Could not delete loan.', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <AppLayout title="Loans" subtitle="Every debt you're carrying, in one ledger">
      <div className="flex justify-end mb-5">
        <button onClick={openCreate} className="btn-primary">
          + Add loan
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card h-20 animate-pulse" />
          ))}
        </div>
      ) : loans.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-parchment-dim">You haven't added any loans yet.</p>
          <button onClick={openCreate} className="btn-primary mt-4">
            Add your first loan
          </button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-surface-border text-parchment-faint uppercase text-xs tracking-wide">
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Original</th>
                <th className="px-5 py-3 font-medium">Outstanding</th>
                <th className="px-5 py-3 font-medium">Rate</th>
                <th className="px-5 py-3 font-medium">Due date</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((loan) => (
                <tr key={loan.loan_id} className="border-b border-surface-border last:border-0 hover:bg-ink-800/50">
                  <td className="px-5 py-4 text-parchment font-medium">{loan.loan_type}</td>
                  <td className="px-5 py-4 font-mono text-parchment-dim">
                    ₹{loan.loan_amount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-5 py-4 font-mono text-gold">
                    ₹{loan.outstanding_amount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-5 py-4 font-mono text-parchment-dim">{loan.interest_rate}%</td>
                  <td className="px-5 py-4 text-parchment-dim">
                    {loan.due_date ? new Date(loan.due_date).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-5 py-4 text-right space-x-3">
                    <button onClick={() => openEdit(loan)} className="text-mint hover:underline text-xs font-medium">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(loan.loan_id)}
                      disabled={deletingId === loan.loan_id}
                      className="text-coral hover:underline text-xs font-medium disabled:opacity-50"
                    >
                      {deletingId === loan.loan_id ? 'Deleting…' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingLoan ? 'Edit loan' : 'Add a loan'}>
        <LoanForm
          initial={editingLoan}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          submitting={submitting}
        />
      </Modal>
    </AppLayout>
  )
}
