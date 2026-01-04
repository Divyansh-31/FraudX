"use client"

import * as React from "react"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  RadialBarChart,
  RadialBar,
} from "recharts"
import transactions from "@/lib/data"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

const COLORS = { safe: "#10b981", fraud: "#fb7185", neutral: "#64748b" }

function lastNDays(n: number) {
  const days: string[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

export default function AnalyticsPage() {
  const [refreshKey, setRefreshKey] = React.useState(0)

  // Fraud Source Donut: Location Spoofing vs Image Tampering vs OTP Bombing
  const fraudCounts = React.useMemo(() => {
    const res = { "Location Spoofing": 0, "Image Tampering": 0, "OTP Bombing": 0 }
    transactions.forEach((t) => {
      if (t.riskScore > 80) res["Location Spoofing"]++
      else if (t.productName.toLowerCase().includes("cam") || t.productName.toLowerCase().includes("camera")) res["Image Tampering"]++
      else res["OTP Bombing"]++
    })
    return Object.entries(res).map(([name, value]) => ({ name, value }))
  }, [refreshKey])

  // Last 7 days stacked risk scores: count of low/medium/high per day
  const last7 = lastNDays(7)
  const riskBuckets = React.useMemo(() => {
    const map: Record<string, { low: number; medium: number; high: number }> = {}
    last7.forEach((d) => (map[d] = { low: 0, medium: 0, high: 0 }))
    transactions.forEach((t) => {
      const d = new Date(t.timestamp).toISOString().slice(0, 10)
      if (!map[d]) return
      if (t.riskScore < 40) map[d].low++
      else if (t.riskScore < 70) map[d].medium++
      else map[d].high++
    })
    return last7.map((d) => ({ date: d, ...map[d] }))
  }, [refreshKey])

  // Radial: System Accuracy (simulate false positive rate from transactions)
  const accuracy = React.useMemo(() => {
    const total = transactions.length
    const falsePositives = transactions.filter((t) => t.status === "Blocked" && t.riskScore < 50).length
    const falsePositiveRate = total ? (falsePositives / total) * 100 : 0
    return Math.round((100 - falsePositiveRate) * 100) / 100 // accuracy percent
  }, [refreshKey])

  function handleRefresh() {
    setRefreshKey((k) => k + 1)
    try { toast.success("Analytics refreshed") } catch (e) { /* ignore */ }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-slate-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <Button onClick={handleRefresh} variant="ghost">Refresh Data</Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Fraud Source</CardTitle>
            <CardDescription>AI Insight: Distribution of detected fraud origin.</CardDescription>
          </CardHeader>
          <div className="p-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={fraudCounts} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={4}>
                  {fraudCounts.map((_, idx) => (
                    <Cell key={idx} fill={idx === 0 ? COLORS.fraud : idx === 1 ? COLORS.fraud : COLORS.neutral} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Risk Scores (Last 7 Days)</CardTitle>
            <CardDescription>AI Insight: Stacked counts of risk severity per day.</CardDescription>
          </CardHeader>
          <div className="p-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskBuckets} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.06} />
                <XAxis dataKey="date" tick={{ fill: "#e6eef6" }} />
                <YAxis tick={{ fill: "#e6eef6" }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="low" stackId="a" fill="#10b981" />
                <Bar dataKey="medium" stackId="a" fill="#f59e0b" />
                <Bar dataKey="high" stackId="a" fill="#fb7185" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Accuracy</CardTitle>
            <CardDescription>AI Insight: Estimated true positive rate (lower is better for false positives).</CardDescription>
          </CardHeader>
          <div className="p-4 h-56 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart innerRadius="10%" outerRadius="80%" data={[{ name: "accuracy", value: accuracy, fill: COLORS.safe }]} startAngle={90} endAngle={-270}>
                <RadialBar minAngle={15} background clockWise={true} dataKey="value" />
                <Legend />
                <Tooltip />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  )
}
