"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type InfoCardProps = {
  title: string
  value: React.ReactNode
  label?: string
  trend?: React.ReactNode
  className?: string
}

export default function InfoCard({ title, value, label, trend, className }: InfoCardProps) {
  return (
    <div className={cn("w-full rounded-xl p-4 sm:p-6 shadow-lg", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">{title}</div>
          <div className="mt-2 text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight text-white">{value}</div>
          {label ? (
            <div className="mt-1 text-sm text-[var(--text-secondary)]">{label}</div>
          ) : null}
        </div>
        {trend ? (
          <div className="flex-shrink-0 self-center ml-2">{trend}</div>
        ) : null}
      </div>
    </div>
  )
}
