"use client"

import * as React from "react"
import transactions from "@/lib/data"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts"

// Aggregate by day (YYYY-MM-DD) with compact label
function aggregateByDay() {
  const map = new Map<string, { date: string; label: string; revenue: number; orders: number }>()

  transactions.forEach((t) => {
    const d = new Date(t.timestamp)
    const key = d.toISOString().slice(0, 10)
    const entry = map.get(key) || { date: key, label: new Date(key).toLocaleDateString(undefined, { month: "short", day: "numeric" }), revenue: 0, orders: 0 }
    entry.revenue += t.amount
    entry.orders += 1
    map.set(key, entry)
  })

  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date))
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null
  // ensure payload ordered: revenue first then orders
  return (
    <div className="p-2 text-sm" style={{ background: "#0f172a", borderRadius: 6 }}>
      <div className="text-xs text-zinc-400">{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <div style={{ width: 10, height: 10, background: p.stroke, borderRadius: 2 }} />
          <div className="text-zinc-200">
            {p.name}: {p.dataKey === "revenue" ? `$${(p.value as number).toFixed(2)}` : p.value}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function RevenueOrdersChart() {
  const data = React.useMemo(() => aggregateByDay(), [])

  // Add deterministic wavy variation for visual interest
  const transformed = React.useMemo(() => {
    return data.map((d, i) => {
      const wave = 0.12 * Math.sin(i * 1.3) // ~±12% variation
      const revenue = Number((d.revenue * (1 + wave)).toFixed(2))
      const orders = Math.max(0, d.orders + Math.round(1.2 * Math.sin(i * 0.9)))
      return { ...d, revenue, orders }
    })
  }, [data])

  const maxRevenue = React.useMemo(() => (transformed.length ? Math.max(...transformed.map((d) => d.revenue)) : 0), [transformed])

  function RevenueDot(props: any) {
    const { cx, cy, payload } = props
    if (cx == null || cy == null) return null
    const r = Math.max(3, Math.min(12, Math.round((payload.revenue / (maxRevenue || 1)) * 12)))
    return <circle cx={cx} cy={cy} r={r} fill="#06b6d4" stroke="#063740" strokeWidth={1} />
  }

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <LineChart data={transformed}>
          <defs>
            <linearGradient id="revGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
          <XAxis dataKey="label" tick={{ fill: "#9ca3af" }} />
          <YAxis yAxisId="left" tick={{ fill: "#9ca3af" }} tickFormatter={(v) => `$${Number(v).toFixed(0)}`} />
          <YAxis yAxisId="right" orientation="right" tick={{ fill: "#9ca3af" }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ color: "#9ca3af" }} />

          <Line
            yAxisId="left"
            type="basis"
            dataKey="revenue"
            name="Revenue"
            stroke="#06b6d4"
            strokeWidth={3}
            dot={RevenueDot}
            activeDot={{ r: 6 }}
            isAnimationActive={true}
            animationDuration={800}
          />

          <Line
            yAxisId="right"
            type="basis"
            dataKey="orders"
            name="Orders"
            stroke="#f97316"
            strokeWidth={2}
            dot={{ r: 3 }}
            isAnimationActive={true}
            animationDuration={1000}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
