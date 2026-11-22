import { useEffect, useState } from 'react'
import AppLayout from '../components/AppLayout'
import PriorityBadge from '../components/PriorityBadge'
import SettlementTrendsChart from '../components/charts/SettlementTrendsChart'
import MonthlyAnalysisChart from '../components/charts/MonthlyAnalysisChart'
import { fetchLoans } from '../services/loanService'
import { predictSettlement, fetchSettlements } from '../services/settlementService'
import { fetchDashboard } from '../services/dashboardService'
import { useToast } from '../components/Toast'

export default function Settlements() {
  const { showToast } = useToast()
  const [loans, setLoans] = useState([])
  const [records, setRecords] = useState([])
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [predictingId, setPredictingId] = useState(null)

  const load = () => {
    setLoading(true)
    Promise.all([fetchLoans(), fetchDashboard(), fetchSettlements()])
      .then(([loanList, dash, settlementList]) => {
        setLoans(loanList)
        setDashboard(dash)
        setRecords(settlementList || [])
      })
      .catch(() => showToast('Could not load settlement data.', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handlePredict = async (loanId) => {
    setPredictingId(loanId)
    try {
      const record = await predictSettlement(loanId)
      setRecords((prev) => [...prev, record])
      showToast('Settlement prediction generated.', 'success')
    } catch (err) {
      showToast(err.response?.data?.detail || 'Prediction failed.', 'error')
    } finally {
      setPredictingId(null)
    }
  }

  const latestByLoan = {}
  records.forEach((r) => {
    latestByLoan[r.loan_id] = r
  })

  return (
    <AppLayout title="Settlements" subtitle="Predict outcomes and prioritize your negotiations">
      {loading ? (
        <div className="card h-64 animate-pulse" />
      ) : (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <p className="eyebrow mb-4">Settlement probability trend</p>
              <SettlementTrendsChart settlements={records} />
            </div>
            <div className="card p-6">
              <p className="eyebrow mb-4">Monthly financial analysis</p>
              <MonthlyAnalysisChart
                monthlyIncome={dashboard?.monthly_income}
                monthlyExpenses={dashboard?.monthly_expenses}
              />
            </div>
          </div>

          {loans.length === 0 ? (
            <div className="card p-10 text-center text-parchment-dim">
              Add a loan first to run settlement predictions.
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-surface-border text-parchment-faint uppercase text-xs tracking-wide">
                    <th className="px-5 py-3 font-medium">Loan</th>
                    <th className="px-5 py-3 font-medium">Outstanding</th>
                    <th className="px-5 py-3 font-medium">Probability</th>
                    <th className="px-5 py-3 font-medium">Recommended offer</th>
                    <th className="px-5 py-3 font-medium">Priority</th>
                    <th className="px-5 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map((loan) => {
                    const record = latestByLoan[loan.loan_id]
                    return (
                      <tr key={loan.loan_id} className="border-b border-surface-border last:border-0">
                        <td className="px-5 py-4 text-parchment font-medium">{loan.loan_type}</td>
                        <td className="px-5 py-4 font-mono text-parchment-dim">
                          ₹{loan.outstanding_amount.toLocaleString('en-IN')}
                        </td>
                        <td className="px-5 py-4 font-mono text-mint">
                          {record ? `${record.settlement_prediction}%` : '—'}
                        </td>
                        <td className="px-5 py-4 font-mono text-gold">
                          {record ? `₹${record.recommended_amount.toLocaleString('en-IN')}` : '—'}
                        </td>
                        <td className="px-5 py-4">
                          {record ? <PriorityBadge level={record.priority_level} /> : '—'}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => handlePredict(loan.loan_id)}
                            disabled={predictingId === loan.loan_id}
                            className="btn-secondary !px-3 !py-1.5 text-xs"
                          >
                            {predictingId === loan.loan_id ? 'Predicting…' : 'Run prediction'}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  )
}
