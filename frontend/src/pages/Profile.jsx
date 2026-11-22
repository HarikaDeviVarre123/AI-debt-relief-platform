import { useEffect, useState } from 'react'
import AppLayout from '../components/AppLayout'
import { fetchProfile, createProfile, updateProfile } from '../services/profileService'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../components/Toast'
import RecoveryArc from '../components/RecoveryArc'

export default function Profile() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({ monthly_income: '', monthly_expenses: '', existing_debts: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [exists, setExists] = useState(false)

  useEffect(() => {
    fetchProfile()
      .then((data) => {
        setProfile(data)
        setExists(true)
        setForm({
          monthly_income: data.monthly_income,
          monthly_expenses: data.monthly_expenses,
          existing_debts: data.existing_debts,
        })
      })
      .catch(() => setExists(false))
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const payload = {
      monthly_income: parseFloat(form.monthly_income),
      monthly_expenses: parseFloat(form.monthly_expenses),
      existing_debts: parseFloat(form.existing_debts),
    }
    try {
      const data = exists ? await updateProfile(payload) : await createProfile(payload)
      setProfile(data)
      setExists(true)
      showToast('Financial profile saved.', 'success')
    } catch (err) {
      showToast(err.response?.data?.detail || 'Could not save profile.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppLayout title="Profile" subtitle="Your account and financial snapshot">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-ink-800 border border-surface-border flex items-center justify-center font-display text-2xl text-gold">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <p className="text-parchment font-medium">{user?.name}</p>
              <p className="text-sm text-parchment-faint">{user?.email}</p>
            </div>
          </div>
          <div className="divider my-5" />
          {profile ? (
            <div className="flex flex-col items-center">
              <p className="eyebrow mb-3">Health score</p>
              <RecoveryArc score={profile.financial_health_score} size={180} />
            </div>
          ) : (
            <p className="text-sm text-parchment-faint">
              Save your financial profile to see your health score.
            </p>
          )}
        </div>

        <div className="lg:col-span-2 card p-6">
          <p className="eyebrow mb-4">Financial profile</p>
          {loading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-10 bg-ink-800 rounded" />
              <div className="h-10 bg-ink-800 rounded" />
              <div className="h-10 bg-ink-800 rounded" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-text block mb-1.5">Monthly income (₹)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={form.monthly_income}
                  onChange={handleChange('monthly_income')}
                  className="input-field"
                  placeholder="65000"
                />
              </div>
              <div>
                <label className="label-text block mb-1.5">Monthly expenses (₹)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={form.monthly_expenses}
                  onChange={handleChange('monthly_expenses')}
                  className="input-field"
                  placeholder="42000"
                />
              </div>
              <div>
                <label className="label-text block mb-1.5">Existing debts (₹, total)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={form.existing_debts}
                  onChange={handleChange('existing_debts')}
                  className="input-field"
                  placeholder="380000"
                />
              </div>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Saving…' : exists ? 'Update profile' : 'Save profile'}
              </button>
            </form>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
