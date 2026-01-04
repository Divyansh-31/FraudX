"use client"

import * as React from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
import { type Transaction } from "@/lib/data"

export default function TransactionVolumeChart({ data }: { data: Transaction[] }) {
  // Aggregate counts per day
  const map = new Map<string, number>()
  data.forEach((t) => {
    const d = new Date(t.timestamp).toISOString().slice(0, 10)
    map.set(d, (map.get(d) ?? 0) + 1)
  })

  const chartData = Array.from(map.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div className="h-44 w-full rounded-lg bg-neutral-950 p-3">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.06} />
          <XAxis dataKey="date" tick={{ fill: "#f1f5f9" }} />
          <YAxis tick={{ fill: "#f1f5f9" }} />
          <Tooltip />
          <Area type="monotone" dataKey="count" stroke="#10b981" fill="#065f46" fillOpacity={0.2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
