export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gold to-mint flex items-center justify-center text-ink-900 font-display font-bold text-lg">
            F
          </div>
          <span className="font-display text-lg text-parchment">FinRelief AI</span>
        </div>
        <div className="card p-8">
          <h2 className="font-display text-2xl text-parchment">{title}</h2>
          <p className="text-sm text-parchment-faint mt-1 mb-6">{subtitle}</p>
          {children}
        </div>
        {footer && <p className="text-center text-sm text-parchment-dim mt-5">{footer}</p>}
      </div>
    </div>
  )
}
