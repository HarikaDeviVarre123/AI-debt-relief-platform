import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function MonthlyAnalysisChart({ monthlyIncome, monthlyExpenses }) {
  if (!monthlyIncome && !monthlyExpenses) {
    return (
      <div className="h-[260px] flex items-center justify-center text-parchment-faint text-sm">
        Create a financial profile to see monthly analysis
      </div>
    )
  }

  const income = monthlyIncome || 0
  const expenses = monthlyExpenses || 0
  const savings = Math.max(income - expenses, 0)

  // Projects a simple 6-month trajectory assuming stable income/expenses,
  // illustrating cumulative savings growth as a proxy for recovery progress.
  const data = Array.from({ length: 6 }).map((_, i) => ({
    name: `M${i + 1}`,
    income,
    expenses,
    savings: Math.round(savings * (i + 1)),
  }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4FD1AE" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#4FD1AE" stopOpacity={0} />
          </linearGradient>
        </defs>
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
        <Area type="monotone" dataKey="savings" stroke="#4FD1AE" strokeWidth={2.5} fill="url(#savingsGradient)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
