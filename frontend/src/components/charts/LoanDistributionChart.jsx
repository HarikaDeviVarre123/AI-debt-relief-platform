import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const COLORS = ['#C9A227', '#4FD1AE', '#E2725B', '#8FE9CE', '#E0BE4E']

export default function LoanDistributionChart({ data }) {
  if (!data || data.length === 0) {
    return <EmptyState />
  }

  const chartData = data.map((d) => ({ name: d.loan_type, value: d.total_outstanding }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          innerRadius={62}
          outerRadius={92}
          paddingAngle={3}
          strokeWidth={0}
        >
          {chartData.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`}
          contentStyle={{
            background: '#1A302A',
            border: '1px solid #254038',
            borderRadius: 10,
            color: '#EDE7DA',
            fontSize: 13,
          }}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value) => <span style={{ color: '#B9C4BE', fontSize: 12 }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

function EmptyState() {
  return (
    <div className="h-[260px] flex items-center justify-center text-parchment-faint text-sm">
      Add a loan to see your distribution
    </div>
  )
}
