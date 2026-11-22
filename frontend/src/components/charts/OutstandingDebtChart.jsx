import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'

const COLORS = ['#C9A227', '#4FD1AE', '#E2725B', '#8FE9CE']

export default function OutstandingDebtChart({ loans }) {
  if (!loans || loans.length === 0) {
    return (
      <div className="h-[260px] flex items-center justify-center text-parchment-faint text-sm">
        No loans tracked yet
      </div>
    )
  }

  const data = loans.map((loan) => ({
    name: loan.loan_type,
    outstanding: loan.outstanding_amount,
    original: loan.loan_amount,
  }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#254038" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: '#B9C4BE', fontSize: 12 }} axisLine={{ stroke: '#254038' }} tickLine={false} />
        <YAxis tick={{ fill: '#B9C4BE', fontSize: 11 }} axisLine={false} tickLine={false} />
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
        <Bar dataKey="outstanding" radius={[6, 6, 0, 0]}>
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
