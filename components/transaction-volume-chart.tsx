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
          <defs>
            <linearGradient id="fillPrimary" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-desktop)" stopOpacity={0.9} />
              <stop offset="95%" stopColor="var(--color-desktop)" stopOpacity={0.06} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.06} />
          <XAxis dataKey="date" tick={{ fill: "var(--foreground)" }} />
          <YAxis tick={{ fill: "var(--foreground)" }} />
          <Tooltip />
          <Area type="monotone" dataKey="count" stroke="var(--color-desktop)" fill="url(#fillPrimary)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
