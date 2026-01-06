"use client"

import * as React from "react"
import transactions from "@/lib/data"
import { formatINR } from "@/lib/utils"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts"

// Generate a realistic-looking series for the last `days` days.
// Uses the transaction dataset to derive scale, then adds weekday patterns,
// random noise and occasional spikes so the chart looks natural.
function aggregateByDay(days = 30) {
  // derive scale from real transactions
  const totalRevenue = transactions.reduce((s, t) => s + t.amount, 0)
  const uniqueDays = new Set(transactions.map((t) => new Date(t.timestamp).toISOString().slice(0, 10))).size || 1
  const avgRevenuePerDay = totalRevenue / uniqueDays
  const avgTxAmount = Math.max(1, transactions.reduce((s, t) => s + t.amount, 0) / Math.max(1, transactions.length))

  const out: { date: string; label: string; revenue: number; orders: number }[] = []
  const now = new Date()
  const start = new Date(now)
  start.setDate(now.getDate() - (days - 1))

  for (let i = 0; i < days; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const key = d.toISOString().slice(0, 10)
    const label = d.toLocaleDateString(undefined, { month: "short", day: "numeric" })

    // weekday effect: weekends lower traffic, weekdays higher
    const weekday = d.getDay()
    const weekdayMultiplier = weekday === 0 || weekday === 6 ? 0.7 : 1.0

    // base revenue around the historical average with per-day randomness
    let revenue = avgRevenuePerDay * (0.7 + Math.random() * 1.0) * weekdayMultiplier

    // occasional spikes (marketing, promos, anomalies)
    if (Math.random() < 0.08) revenue *= 1 + 0.5 + Math.random() * 2

    // add very small noise and clamp
    revenue = Math.max(0, Number((revenue * (0.9 + Math.random() * 0.2)).toFixed(2)))

    // derive orders roughly from revenue and average transaction size
    const orders = Math.max(1, Math.round(revenue / Math.max(1, avgTxAmount) * (0.7 + Math.random() * 0.8)))

    out.push({ date: key, label, revenue, orders })
  }

  return out
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
            {p.name}: {p.dataKey === "revenue" ? formatINR(p.value as number) : p.value}
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
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.18} />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
          <XAxis dataKey="label" tick={{ fill: "var(--text-secondary)" }} />
          <YAxis yAxisId="left" tick={{ fill: "var(--text-secondary)" }} tickFormatter={(v) => formatINR(Number(v))} />
          <YAxis yAxisId="right" orientation="right" tick={{ fill: "var(--text-secondary)" }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ color: "var(--text-secondary)" }} />

          <Line
            yAxisId="left"
            type="basis"
            dataKey="revenue"
            name="Revenue"
            stroke="var(--color-primary)"
            strokeWidth={3}
            dot={false}
            activeDot={false}
            isAnimationActive={true}
            animationDuration={800}
          />

          <Line
            yAxisId="right"
            type="basis"
            dataKey="orders"
            name="Orders"
            stroke="var(--color-warning)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={true}
            animationDuration={1000}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
