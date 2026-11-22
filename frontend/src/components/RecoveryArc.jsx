/**
 * RecoveryArc — the signature visual of FinRelief AI.
 *
 * Renders the Financial Health Score as an arc-shaped gauge, evoking a
 * "path to solid ground" — the core metaphor of the product. The arc
 * fills from a coral (distressed) zone through gold (recovering) to
 * mint (healthy) as the score climbs.
 */
export default function RecoveryArc({ score = 0, size = 220 }) {
  const clamped = Math.max(0, Math.min(100, score))
  const radius = size / 2 - 18
  const circumference = Math.PI * radius // half circle
  const offset = circumference - (clamped / 100) * circumference

  const zoneLabel =
    clamped >= 70 ? 'Healthy' : clamped >= 40 ? 'Recovering' : 'At Risk'
  const zoneColor = clamped >= 70 ? '#4FD1AE' : clamped >= 40 ? '#C9A227' : '#E2725B'

  const center = size / 2

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 30} viewBox={`0 0 ${size} ${size / 2 + 30}`}>
        <path
          d={`M 18 ${center} A ${radius} ${radius} 0 0 1 ${size - 18} ${center}`}
          fill="none"
          stroke="#1A302A"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d={`M 18 ${center} A ${radius} ${radius} 0 0 1 ${size - 18} ${center}`}
          fill="none"
          stroke={zoneColor}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(0.16, 1, 0.3, 1), stroke 500ms ease' }}
        />
        <text
          x={center}
          y={center - 8}
          textAnchor="middle"
          className="font-mono"
          style={{ fill: '#EDE7DA', fontSize: 34, fontWeight: 600 }}
        >
          {clamped.toFixed(0)}
        </text>
        <text
          x={center}
          y={center + 16}
          textAnchor="middle"
          style={{ fill: '#7E938C', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}
        >
          out of 100
        </text>
      </svg>
      <span
        className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] px-3 py-1 rounded-full"
        style={{ color: zoneColor, backgroundColor: `${zoneColor}22`, border: `1px solid ${zoneColor}44` }}
      >
        {zoneLabel}
      </span>
    </div>
  )
}
