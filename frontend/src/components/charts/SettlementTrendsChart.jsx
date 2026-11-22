import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function SettlementTrendsChart({ settlements }) {
  if (!settlements || settlements.length === 0) {
    return (
      <div className="h-[260px] flex items-center justify-center text-parchment-faint text-sm">
        Run a settlement prediction to see trends
      </div>
    )
  }

  const data = settlements
    .slice()
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .map((s, idx) => ({
      name: `#${idx + 1}`,
      probability: s.settlement_prediction,
    }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#254038" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: '#B9C4BE', fontSize: 12 }} axisLine={{ stroke: '#254038' }} tickLine={false} />
        <YAxis
          tick={{ fill: '#B9C4BE', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip
          formatter={(value) => `${value}%`}
          contentStyle={{
            background: '#1A302A',
            border: '1px solid #254038',
            borderRadius: 10,
            color: '#EDE7DA',
            fontSize: 13,
          }}
        />
        <Line
          type="monotone"
          dataKey="probability"
          stroke="#4FD1AE"
          strokeWidth={2.5}
          dot={{ fill: '#4FD1AE', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
