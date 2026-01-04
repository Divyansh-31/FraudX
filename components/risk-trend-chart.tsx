"use client"

import * as React from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
import { type Transaction } from "@/lib/data"

export default function RiskTrendChart({ data }: { data: Transaction[] }) {
  // Aggregate average riskScore per day
  const map = new Map<string, { sum: number; count: number }>()

  data.forEach((t) => {
    const d = new Date(t.timestamp).toISOString().slice(0, 10)
    const cur = map.get(d) ?? { sum: 0, count: 0 }
    cur.sum += t.riskScore
    cur.count += 1
    map.set(d, cur)
  })

  const chartData = Array.from(map.entries())
    .map(([date, v]) => ({ date, avgRisk: Math.round(v.sum / v.count) }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div className="h-36 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.06} />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line type="monotone" dataKey="avgRisk" stroke="#2563eb" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
