'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

export default function RevenueSummaryChart({ data }: { data: any[] }) {

  return (
    <div className="w-full h-[320px]">

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="month" />

          <YAxis />

          <Tooltip />

          <Legend />

          <Line
            type="monotone"
            dataKey="sales"
            stroke="#2563eb"
            strokeWidth={3}
            dot={false}
          />

          <Line
            type="monotone"
            dataKey="expenses"
            stroke="#16a34a"
            strokeWidth={3}
            dot={false}
          />

        </LineChart>
      </ResponsiveContainer>

    </div>
  )
}