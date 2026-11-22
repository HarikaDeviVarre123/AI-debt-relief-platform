import { Link } from 'react-router-dom'
import RecoveryArc from '../components/RecoveryArc'

export default function Landing() {
  return (
    <div className="min-h-screen bg-ink">
      <header className="px-6 lg:px-10 py-6 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gold to-mint flex items-center justify-center text-ink-900 font-display font-bold text-lg">
            F
          </div>
          <span className="font-display text-lg text-parchment">FinRelief AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-ghost">
            Log in
          </Link>
          <Link to="/register" className="btn-primary">
            Get started
          </Link>
        </div>
      </header>

      <section className="px-6 lg:px-10 pt-10 pb-20 max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <span className="eyebrow">Debt relief, engineered</span>
          <h1 className="font-display text-4xl md:text-5xl leading-[1.08] mt-4 text-parchment">
            Find solid ground under your debt.
          </h1>
          <p className="text-parchment-dim text-lg mt-5 leading-relaxed max-w-lg">
            FinRelief AI reads your loans, scores your financial health, and drafts
            the negotiation strategy and settlement letters that get creditors to
            say yes — all in one dashboard.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link to="/register" className="btn-primary">
              Start your recovery plan
            </Link>
            <Link to="/login" className="btn-secondary">
              I already have an account
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-12 max-w-md">
            <div>
              <p className="font-mono text-2xl text-gold font-semibold">0-100</p>
              <p className="text-xs text-parchment-faint mt-1">Health score scale</p>
            </div>
            <div>
              <p className="font-mono text-2xl text-mint font-semibold">4</p>
              <p className="text-xs text-parchment-faint mt-1">AI-drafted documents</p>
            </div>
            <div>
              <p className="font-mono text-2xl text-parchment font-semibold">1</p>
              <p className="text-xs text-parchment-faint mt-1">Place to track it all</p>
            </div>
          </div>
        </div>

        <div className="card p-8 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-gold/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-mint/10 rounded-full blur-3xl" />
          <p className="eyebrow mb-6 relative">Financial Health Score</p>
          <div className="relative">
            <RecoveryArc score={68} size={260} />
          </div>
          <p className="text-sm text-parchment-faint text-center mt-6 max-w-xs relative">
            Every score is explainable: savings rate, debt-to-income, and expense
            load, weighted transparently — never a black box.
          </p>
        </div>
      </section>

      <section className="px-6 lg:px-10 pb-20 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: 'Track every loan',
              body: 'Credit cards, personal loans, auto and home debt — one clear ledger with live outstanding balances.',
              glyph: '◎',
            },
            {
              title: 'Predict settlements',
              body: 'A transparent model estimates settlement probability, recommended offer, and negotiation priority per loan.',
              glyph: '⟐',
            },
            {
              title: 'Negotiate with AI',
              body: 'Gemini drafts negotiation strategies and settlement letters tailored to each creditor and balance.',
              glyph: '✦',
            },
          ].map((f) => (
            <div key={f.title} className="card p-6">
              <span className="text-2xl text-gold">{f.glyph}</span>
              <h3 className="font-display text-lg mt-3 text-parchment">{f.title}</h3>
              <p className="text-sm text-parchment-dim mt-2 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="px-6 lg:px-10 py-8 border-t border-surface-border text-center text-xs text-parchment-faint">
        FinRelief AI — a demo debt relief and financial recovery platform.
      </footer>
    </div>
  )
}
