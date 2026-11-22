import { useEffect, useState } from 'react'
import AppLayout from '../components/AppLayout'
import StatCard from '../components/StatCard'
import RecoveryArc from '../components/RecoveryArc'
import LoanDistributionChart from '../components/charts/LoanDistributionChart'
import OutstandingDebtChart from '../components/charts/OutstandingDebtChart'
import { fetchDashboard } from '../services/dashboardService'
import { fetchLoans } from '../services/loanService'
import { useToast } from '../components/Toast'

export default function Dashboard() {
  const { showToast } = useToast()
  const [data, setData] = useState(null)
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    Promise.all([fetchDashboard(), fetchLoans()])
      .then(([dash, loanList]) => {
        if (!mounted) return
        setData(dash)
        setLoans(loanList)
      })
      .catch(() => showToast('Could not load dashboard data.', 'error'))
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [])

  if (loading) {
    return (
      <AppLayout title="Overview" subtitle="Your financial recovery at a glance">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card h-28" />
            ))}
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="card h-80 lg:col-span-1" />
            <div className="card h-80 lg:col-span-2" />
          </div>
        </div>
      </AppLayout>
    )
  }

  if (!data) {
    return (
      <AppLayout title="Overview" subtitle="Your financial recovery at a glance">
        <div className="card p-8 text-center space-y-4">
          <p className="text-parchment-faint">Unable to load dashboard data. Ensure the backend server is running.</p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            Retry
          </button>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Overview" subtitle="Your financial recovery at a glance">
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total loans" value={data.total_loans} accent="gold" icon="◎" />
          <StatCard
            label="Outstanding amount"
            value={`₹${data.total_outstanding_amount.toLocaleString('en-IN')}`}
            accent="coral"
            icon="⟐"
          />
          <StatCard
            label="Debt-to-income"
            value={`${data.debt_to_income_ratio}%`}
            accent="gold"
            icon="◈"
          />
          <StatCard
            label="Avg. settlement odds"
            value={`${data.average_settlement_probability}%`}
            accent="mint"
            icon="✦"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="card p-6 flex flex-col items-center justify-center lg:col-span-1">
            <p className="eyebrow mb-4">Financial health score</p>
            <RecoveryArc score={data.financial_health_score} />
          </div>

          <div className="card p-6 lg:col-span-1">
            <p className="eyebrow mb-4">Loan distribution</p>
            <LoanDistributionChart data={data.loan_distribution} />
          </div>

          <div className="card p-6 lg:col-span-1">
            <p className="eyebrow mb-4">Outstanding by loan</p>
            <OutstandingDebtChart loans={loans} />
          </div>
        </div>

        <div className="card p-6">
          <p className="eyebrow mb-4">Recent AI activity</p>
          {data.recent_ai_activities.length === 0 ? (
            <p className="text-sm text-parchment-faint">
              No AI activity yet. Head to the AI Assistant to generate a strategy or letter.
            </p>
          ) : (
            <ul className="divide-y divide-surface-border">
              {data.recent_ai_activities.map((a) => (
                <li key={a.history_id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-mint text-lg">✦</span>
                    <span className="text-sm text-parchment">{a.summary}</span>
                  </div>
                  <span className="text-xs text-parchment-faint font-mono">
                    {new Date(a.generated_at).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
