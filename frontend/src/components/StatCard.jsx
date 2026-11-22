export default function StatCard({ label, value, delta, accent = 'gold', icon }) {
  const accentClasses = {
    gold: 'text-gold',
    mint: 'text-mint',
    coral: 'text-coral',
  }

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <p className="label-text">{label}</p>
        {icon && <span className={`text-lg ${accentClasses[accent]}`}>{icon}</span>}
      </div>
      <p className="stat-value mt-2">{value}</p>
      {delta && <p className="text-xs text-parchment-faint mt-1">{delta}</p>}
    </div>
  )
}
