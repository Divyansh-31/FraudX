"use client"

import * as React from "react"
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Check, MapPin, Image, Key } from "lucide-react"
import { type AuditLog } from "@/lib/audit"

const columnHelper = createColumnHelper<AuditLog>()

function EventIcon({ type }: { type: string }) {
  if (type === "Geofence Breach") return <MapPin className="size-4" />
  if (type === "Successful Verification") return <Check className="size-4" />
  if (type === "Image Forensics") return <Image className="size-4" />
  return <AlertTriangle className="size-4" />
}

export default function AuditLogsTable({ data }: { data: AuditLog[] }) {
  const columns = React.useMemo(
    () => [
      columnHelper.accessor("timestamp", { header: "Timestamp", cell: (info) => new Date(info.getValue()).toLocaleString() }),
      columnHelper.accessor("eventType", { header: "Event", cell: (info) => (
        <div className="flex items-center gap-2">
          <EventIcon type={info.getValue() as string} />
          <span className="truncate">{info.getValue() as string}</span>
        </div>
      ) }),
      columnHelper.accessor("deviceId", { header: "User/Device ID", cell: (info) => info.getValue() }),
      columnHelper.accessor("module", { header: "Module", cell: (info) => info.getValue() }),
      columnHelper.accessor("actionTaken", { header: "Action", cell: (info) => {
        const v = info.getValue() as string
        if (v === "Blocked") return <Badge variant="destructive">{v}</Badge>
        if (v === "Flagged") return <Badge variant="outline" className="text-amber-400 border-amber-600">{v}</Badge>
        return <Badge variant="secondary">{v}</Badge>
      } }),
    ],
    []
  )

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() })

  return (
    <div className="overflow-auto rounded bg-neutral-950">
      <table className="w-full min-w-[720px] divide-y divide-zinc-700 text-sm">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => (
                <th key={header.id} className="px-3 py-2 text-left font-medium text-zinc-400">
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-zinc-900">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-3 py-2 align-middle text-zinc-200">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
