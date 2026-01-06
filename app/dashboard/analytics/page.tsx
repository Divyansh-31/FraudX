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
  Label,
} from "recharts"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Mock transactions data
const transactions = [
  { timestamp: new Date().toISOString(), riskScore: 85, status: "Blocked", productName: "Phone" },
  { timestamp: new Date().toISOString(), riskScore: 45, status: "Approved", productName: "Camera" },
  { timestamp: new Date().toISOString(), riskScore: 92, status: "Blocked", productName: "Laptop" },
  { timestamp: new Date().toISOString(), riskScore: 35, status: "Approved", productName: "Camera" },
  { timestamp: new Date().toISOString(), riskScore: 78, status: "Blocked", productName: "Tablet" },
  { timestamp: new Date().toISOString(), riskScore: 88, status: "Blocked", productName: "Watch" },
  { timestamp: new Date().toISOString(), riskScore: 25, status: "Approved", productName: "Headphones" },
  { timestamp: new Date().toISOString(), riskScore: 65, status: "Approved", productName: "Speaker" },
  { timestamp: new Date().toISOString(), riskScore: 95, status: "Blocked", productName: "Phone" },
  { timestamp: new Date().toISOString(), riskScore: 42, status: "Approved", productName: "Cam" },
]

const COLORS = { safe: "#10b981", fraud: "#fb7185", neutral: "#64748b", warning : "#f59e0b" }

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
  const [isDark, setIsDark] = React.useState(false)

  React.useEffect(() => {
    // Check initial theme
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark') || 
                window.matchMedia('(prefers-color-scheme: dark)').matches)
    }
    
    checkTheme()
    
    // Watch for theme changes
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    
    // Watch for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => checkTheme()
    mediaQuery.addEventListener('change', handleChange)
    
    return () => {
      observer.disconnect()
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  // Fraud Source Donut: Location Spoofing vs Image Tampering vs OTP Bombing
  const fraudCounts = React.useMemo(() => {
    return [
      { name: "OTP Bombing", value: 25, fill: "#ef4444" },
      { name: "Location Spoofing", value: 10, fill: "#f97316" },
      { name: "Image Tampering", value: 8, fill: "#94a3b8" }
    ]
  }, [refreshKey])

  const totalFraud = React.useMemo(() => {
    return fraudCounts.reduce((acc, curr) => acc + curr.value, 0)
  }, [fraudCounts])

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
    // Add random values for days with zero data
    return last7.map((d) => {
      const data = map[d]
      const total = data.low + data.medium + data.high
      if (total === 0) {
        return {
          date: d.slice(5),
          low: Math.floor(Math.random() * 5) + 3,
          medium: Math.floor(Math.random() * 3) + 1,
          high: Math.floor(Math.random() * 3) + 1
        }
      }
      return { date: d.slice(5), ...data }
    })
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
    // Simple alert instead of toast
    alert("Analytics refreshed")
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-slate-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-slate-100">Analytics</h1>
        <Button onClick={handleRefresh} variant="ghost" className="text-slate-100">Refresh Data</Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="items-center pb-2">
            <CardTitle className="text-slate-100">Fraud Source</CardTitle>
            <CardDescription className="text-slate-400">AI Insight: Distribution of detected fraud origin.</CardDescription>
          </CardHeader>
          <div className="p-4 h-96 flex flex-col">
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fraudCounts}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    strokeWidth={5}
                  >
                    {fraudCounts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="text-3xl font-bold fill-slate-100"
                              >
                                {totalFraud.toLocaleString()}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className="text-sm fill-slate-400"
                              >
                                Total Fraud
                              </tspan>
                            </text>
                          )
                        }
                      }}
                    />
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', color: '#f1f5f9' }}
                    itemStyle={{ color: '#f1f5f9' }}
                    labelStyle={{ color: '#f1f5f9' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 flex-wrap pb-2">
              {fraudCounts.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center gap-2"
                >
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="text-sm text-slate-300">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2 bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-slate-100">Risk Scores (Last 7 Days)</CardTitle>
            <CardDescription className="text-slate-400">AI Insight: Stacked counts of risk severity per day.</CardDescription>
          </CardHeader>
          <div className="p-4 h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskBuckets} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" strokeOpacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }} 
                />
                <YAxis 
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }} 
                />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', color: '#f1f5f9' }} />
                <Legend wrapperStyle={{ color: '#94a3b8' }} />
                <Bar
                  dataKey="low"
                  stackId="a"
                  fill="#94a3b8"
                  radius={[0, 0, 4, 4]}
                />
                <Bar
                  dataKey="medium"
                  stackId="a"
                  fill="#f97316"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="high"
                  stackId="a"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  )
}