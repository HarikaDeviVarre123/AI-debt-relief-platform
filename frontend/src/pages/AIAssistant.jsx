import { useEffect, useState } from 'react'
import AppLayout from '../components/AppLayout'
import { fetchLoans } from '../services/loanService'
import { generateStrategy, generateLetter, generateAdvice } from '../services/aiService'
import { useToast } from '../components/Toast'
import { useAuth } from '../hooks/useAuth'

const TABS = [
  { id: 'strategy', label: 'Negotiation strategy' },
  { id: 'letter', label: 'Settlement letter' },
  { id: 'advice', label: 'Financial advice' },
]

export default function AIAssistant() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [loans, setLoans] = useState([])
  const [tab, setTab] = useState('strategy')
  const [selectedLoanId, setSelectedLoanId] = useState('')
  const [notes, setNotes] = useState('')
  const [offerAmount, setOfferAmount] = useState('')
  const [tone, setTone] = useState('professional')
  const [borrowerName, setBorrowerName] = useState(user?.name || '')
  const [borrowerAddress, setBorrowerAddress] = useState('')
  const [lenderName, setLenderName] = useState('')
  const [lenderAddress, setLenderAddress] = useState('')
  const [hardshipReason, setHardshipReason] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (user?.name && !borrowerName) {
      setBorrowerName(user.name)
    }
  }, [user])

  const handleCopy = () => {
    if (!result) return
    navigator.clipboard.writeText(result)
    setCopied(true)
    showToast('Copied to clipboard!', 'success')
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    fetchLoans()
      .then((data) => {
        setLoans(data)
        if (data.length > 0) setSelectedLoanId(String(data[0].loan_id))
      })
      .catch(() => showToast('Could not load loans.', 'error'))
  }, [])

  const handleGenerate = async () => {
    setResult('')
    setLoading(true)
    try {
      let response
      if (tab === 'strategy') {
        if (!selectedLoanId) return showToast('Select a loan first.', 'error')
        response = await generateStrategy(Number(selectedLoanId), notes)
        setResult(response.negotiation_strategy)
      } else if (tab === 'letter') {
        if (!selectedLoanId) return showToast('Select a loan first.', 'error')
        response = await generateLetter({
          loanId: Number(selectedLoanId),
          offerAmount: offerAmount ? Number(offerAmount) : undefined,
          tone,
          borrowerName,
          borrowerAddress,
          lenderName,
          lenderAddress,
          hardshipReason,
        })
        setResult(response.settlement_letter)
      } else {
        response = await generateAdvice()
        setResult(response.ai_response)
      }
      showToast('AI response generated.', 'success')
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        'Failed to generate response. Please try again.'
      showToast(errorMsg, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout title="AI Assistant" subtitle="Gemini-powered negotiation help, on demand">
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 card p-6 h-fit">
          <div className="flex gap-1 bg-ink-800 rounded-lg p-1 mb-6">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTab(t.id)
                  setResult('')
                }}
                className={`flex-1 text-xs font-medium py-2 rounded-md transition-colors ${
                  tab === t.id ? 'bg-mint text-ink-900' : 'text-parchment-dim hover:text-parchment'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {(tab === 'strategy' || tab === 'letter') && (
            <div className="mb-4">
              <label className="label-text block mb-1.5">Loan</label>
              <select
                value={selectedLoanId}
                onChange={(e) => setSelectedLoanId(e.target.value)}
                className="input-field"
              >
                {loans.length === 0 && <option value="">No loans yet</option>}
                {loans.map((loan) => (
                  <option key={loan.loan_id} value={loan.loan_id}>
                    {loan.loan_type} — ₹{loan.outstanding_amount.toLocaleString('en-IN')}
                  </option>
                ))}
              </select>
            </div>
          )}

          {tab === 'strategy' && (
            <div className="mb-4">
              <label className="label-text block mb-1.5">Context (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="input-field resize-none"
                placeholder="e.g. Recently lost my job, can offer a lump sum in 2 weeks"
              />
            </div>
          )}

          {tab === 'letter' && (
            <div className="space-y-3.5 mb-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label-text block mb-1">Borrower's full name</label>
                  <input
                    type="text"
                    value={borrowerName}
                    onChange={(e) => setBorrowerName(e.target.value)}
                    className="input-field text-sm"
                    placeholder="e.g. Asha Verma"
                  />
                </div>
                <div>
                  <label className="label-text block mb-1">Borrower's address</label>
                  <input
                    type="text"
                    value={borrowerAddress}
                    onChange={(e) => setBorrowerAddress(e.target.value)}
                    className="input-field text-sm"
                    placeholder="e.g. 12B Green Park, Delhi - 110016"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label-text block mb-1">Lender / Bank name</label>
                  <input
                    type="text"
                    value={lenderName}
                    onChange={(e) => setLenderName(e.target.value)}
                    className="input-field text-sm"
                    placeholder="e.g. HDFC Bank Ltd."
                  />
                </div>
                <div>
                  <label className="label-text block mb-1">Lender address / branch</label>
                  <input
                    type="text"
                    value={lenderAddress}
                    onChange={(e) => setLenderAddress(e.target.value)}
                    className="input-field text-sm"
                    placeholder="e.g. Card Recovery Dept, Mumbai"
                  />
                </div>
              </div>

              <div>
                <label className="label-text block mb-1">Financial difficulty (reason)</label>
                <textarea
                  value={hardshipReason}
                  onChange={(e) => setHardshipReason(e.target.value)}
                  rows={2}
                  className="input-field resize-none text-xs"
                  placeholder="e.g. Incurred sudden medical emergency expenses and temporary income disruption"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label-text block mb-1">Proposed settlement amount (₹)</label>
                  <input
                    type="number"
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(e.target.value)}
                    className="input-field text-sm"
                    placeholder="Defaults to ~55% of balance"
                  />
                </div>
                <div>
                  <label className="label-text block mb-1">Tone</label>
                  <select value={tone} onChange={(e) => setTone(e.target.value)} className="input-field text-sm">
                    <option value="professional">Professional</option>
                    <option value="firm">Firm</option>
                    <option value="empathetic">Empathetic</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {tab === 'advice' && (
            <p className="text-sm text-parchment-dim mb-4">
              Generates prioritized financial advice from your saved financial profile.
              Make sure you've filled that in on the Profile page first.
            </p>
          )}

          <button onClick={handleGenerate} disabled={loading} className="btn-primary w-full">
            {loading ? 'Generating…' : 'Generate with AI'}
          </button>
        </div>

        <div className="lg:col-span-3 card p-6 min-h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <p className="eyebrow mb-0">Result</p>
            {result && (
              <button
                onClick={handleCopy}
                className="text-xs px-3 py-1.5 rounded bg-ink-800 hover:bg-ink-700 text-parchment-dim hover:text-parchment border border-surface-border transition-colors flex items-center gap-1.5"
                title="Copy to clipboard"
              >
                <span>{copied ? '✓ Copied' : '📋 Copy text'}</span>
              </button>
            )}
          </div>
          {loading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-3 bg-ink-800 rounded w-full" />
              <div className="h-3 bg-ink-800 rounded w-5/6" />
              <div className="h-3 bg-ink-800 rounded w-3/4" />
              <div className="h-3 bg-ink-800 rounded w-full" />
            </div>
          ) : result ? (
            <pre className="whitespace-pre-wrap font-body text-sm text-parchment leading-relaxed">{result}</pre>
          ) : (
            <p className="text-sm text-parchment-faint">
              Your AI-generated response will appear here.
            </p>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
