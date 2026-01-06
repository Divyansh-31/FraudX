"use client"

import * as React from "react"
import transactions, { type Transaction } from "@/lib/data"
import { formatINR } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { IconDotsVertical, IconDownload, IconChevronLeft, IconChevronRight } from "@tabler/icons-react"

function StatusBadge({ status }: { status: string }) {
  const base = "inline-flex items-center px-2 py-0.5 rounded-full text-sm font-medium"
  // Use semantic CSS variables to match card colors
  if (status === "Verified")
    return (
      <span
        className={base}
        style={{ background: "linear-gradient(90deg,var(--color-primary),var(--color-primary-400))", color: "white" }}
      >
        {status}
      </span>
    )
  if (status === "Blocked")
    return (
      <span
        className={base}
        style={{ background: "linear-gradient(90deg,var(--color-alert),var(--color-alert-400))", color: "white" }}
      >
        {status}
      </span>
    )

  // Fallback styles for other statuses
  return <span className={base}>{status}</span>
}

function FlatAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")

  // Simple flat SVG avatar with colored background and initials
  const bg = ["#60a5fa", "#f97316", "#34d399", "#a78bfa"][
    name.length % 4
  ]

  return (
    <Avatar className="mr-3">
      <AvatarFallback>
        <div style={{ backgroundColor: bg }} className="w-full h-full flex items-center justify-center text-white font-semibold">
          {initials}
        </div>
      </AvatarFallback>
    </Avatar>
  )
}

function IdButton({ id }: { id: string }) {
  const [copied, setCopied] = React.useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(id)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch (e) {
      /* ignore */
    }
  }

  return (
    <button onClick={copy} className="text-left text-white font-medium hover:underline inline-flex items-center gap-2" title="Click to copy ID">
      <span className="font-mono">#{id}</span>
      {copied ? <span className="text-xs text-[var(--text-secondary)]">Copied</span> : null}
    </button>
  )
}

export default function RecentOrdersTable({ rows = 8 }: { rows?: number }) {
  const [query, setQuery] = React.useState("")
  const [sort, setSort] = React.useState<"asc" | "desc" | null>(null)

  const data = React.useMemo(() => transactions.slice(0, Math.max(8, rows * 2)), [rows])

  const filtered = data
    .filter((t) => {
      if (!query) return true
      const q = query.toLowerCase()
      return (
        t.productName.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q) ||
        String(t.id).includes(q)
      )
    })
    .slice(0, rows)

  const sorted = React.useMemo(() => {
    if (!sort) return filtered
    return [...filtered].sort((a, b) => (sort === "asc" ? a.amount - b.amount : b.amount - a.amount))
  }, [filtered, sort])

  return (
    <div className="rounded-xl bg-neutral-900/60 border border-white/6 p-4">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold">Recent Orders</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <IconDownload className="size-4 mr-2" /> Export
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <IconDotsVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Refresh</DropdownMenuItem>
              <DropdownMenuItem>Export CSV</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mt-3">
        <Input placeholder="Filter orders..." value={query} onChange={(e) => setQuery((e.target as HTMLInputElement).value)} />
      </div>

      <div className="mt-4 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-[var(--text-secondary)] text-left">
              <th className="py-2">ID</th>
              <th className="py-2">Customer</th>
              <th className="py-2">Product</th>
              <th
                className="py-2 cursor-pointer"
                onClick={() => setSort(sort === "asc" ? "desc" : "asc")}
                title="Sort by amount"
              >
                <span className="inline-flex items-center gap-2">
                  Amount
                  <span className="text-[10px] text-[var(--text-secondary)]">{sort === "asc" ? "▲" : sort === "desc" ? "▼" : ""}</span>
                </span>
              </th>
              <th className="py-2">Status</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/6">
            {sorted.map((t) => (
              <tr key={t.id} className="hover:bg-white/2">
                <td className="py-3 text-[var(--text-secondary)]"><IdButton id={t.id} /></td>
                <td className="py-3 flex items-center">
                  <FlatAvatar name={t.customerName} />
                  <div>
                    <div className="text-white font-medium">{t.customerName}</div>
                    <div className="text-[var(--text-secondary)] text-xs">{t.customerEmail ?? ""}</div>
                  </div>
                </td>
                <td className="py-3 text-[var(--text-secondary)]">{t.productName}</td>
                <td className="py-3 text-white font-mono">{formatINR(t.amount)}</td>
                <td className="py-3">
                  <StatusBadge status={t.status} />
                </td>
                <td className="py-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon"><IconDotsVertical /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>View</DropdownMenuItem>
                      <DropdownMenuItem>Refund</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-[var(--text-secondary)]">Showing 1 to {sorted.length} of 16 entries</div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="w-8 h-8"><IconChevronLeft /></Button>
          <Button variant="ghost" size="sm" className="w-8 h-8"><IconChevronRight /></Button>
        </div>
      </div>
    </div>
  )
}
