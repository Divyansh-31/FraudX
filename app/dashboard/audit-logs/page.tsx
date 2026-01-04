"use client"

import * as React from "react"
import generateAuditLogs, { type AuditLog } from "@/lib/audit"
import AuditLogsTable from "@/components/audit-logs-table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Download, Search } from "lucide-react"

export default function AuditLogsPage() {
  const all = React.useMemo<AuditLog[]>(() => generateAuditLogs, [])
  const [query, setQuery] = React.useState("")
  const [data, setData] = React.useState<AuditLog[]>(all)

  React.useEffect(() => {
    const q = query.trim().toLowerCase()
    if (!q) return setData(all)
    setData(
      all.filter((l) => l.deviceId.toLowerCase().includes(q) || l.eventType.toLowerCase().includes(q))
    )
  }, [query, all])

  function downloadCSV() {
    const rows = ["Timestamp,Event Type,Device ID,Module,Action"]
    data.forEach((r) => rows.push(`${r.timestamp},${r.eventType},${r.deviceId},${r.module},${r.actionTaken}`))
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `audit-logs-${new Date().toISOString()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-100">Audit Logs</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Input
              placeholder="Search by Device ID or Event Type"
              value={query}
              onChange={(e) => setQuery((e.target as HTMLInputElement).value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          </div>
          <Button onClick={downloadCSV} variant="outline">
            <Download className="mr-2" /> Download CSV
          </Button>
        </div>
      </div>

      <div className="mt-4">
        <AuditLogsTable data={data} />
      </div>
    </div>
  )
}
