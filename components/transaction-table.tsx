"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import transactions, { type Transaction } from "@/lib/data"
import { formatINR } from "@/lib/utils"

const columnHelper = createColumnHelper<Transaction>()

export function TransactionTable({ data }: { data?: Transaction[] }) {
  const router = useRouter()
  const table = useReactTable({
    data: data ?? transactions,
    columns: [
      columnHelper.accessor("id", { header: "ID" }),
      columnHelper.accessor("productName", { header: "Product" }),
      columnHelper.accessor("customerName", { header: "Customer" }),
      columnHelper.accessor("amount", {
        header: "Amount",
        cell: (info) => formatINR(info.getValue() as number),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const value = info.getValue() as string
          if (!value) return null
          const baseClasses = "inline-flex items-center rounded-full px-2 py-0.5 text-sm font-medium"

          if (value === "Verified") {
            return (
              <span
                className={baseClasses}
                style={{
                  backgroundColor: "rgba(var(--color-primary-rgb), 0.10)",
                  color: "rgb(var(--color-primary-rgb))",
                  border: "1px solid rgba(var(--color-primary-rgb), 0.20)",
                }}
              >
                {value}
              </span>
            )
          }

          if (value === "Blocked") {
            return (
              <span
                className={baseClasses}
                style={{
                  backgroundColor: "rgba(var(--color-alert-rgb), 0.10)",
                  color: "rgb(var(--color-alert-rgb))",
                  border: "1px solid rgba(var(--color-alert-rgb), 0.20)",
                }}
              >
                {value}
              </span>
            )
          }

          return <span className={baseClasses}>{value}</span>
        },
      }),
      columnHelper.accessor("riskScore", { header: "Risk" }),
      columnHelper.accessor("timestamp", {
        header: "Timestamp",
        cell: (info) => new Date(info.getValue() as string).toLocaleString(),
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => router.push(`/dashboard/map?id=${row.original.id}`)}
          >
            View on Map
          </Button>
        ),
      }),
    ],
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] divide-y divide-zinc-200 dark:divide-zinc-800 text-sm">
        <thead className="bg-transparent">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
                  {hg.headers.map((header) => (
                    <th key={header.id} className="px-3 py-2 text-left font-medium text-zinc-600">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-3 py-2 align-middle text-zinc-900 dark:text-zinc-100">
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

export default TransactionTable
