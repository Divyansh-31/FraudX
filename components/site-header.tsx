"use client"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ModeToggle } from "./ui/mode-toggle"
import { usePathname } from "next/navigation"

function deriveTitleFromPath(pathname: string | null) {
  if (!pathname) return "Dashboard"
  if (pathname.startsWith("/dashboard/audit-logs")) return "Audit Logs"
  if (pathname.startsWith("/dashboard/analytics")) return "Risk Analytics"
  if (pathname.startsWith("/dashboard/map")) return "Map View"
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) return "Dashboard"
  if (pathname.startsWith("/settings")) return "Settings"
  if (pathname === "/") return "Home"
  return pathname.split("/").filter(Boolean).pop()?.replace(/-/g, " ")?.replace(/\b\w/g, (c) => c.toUpperCase()) || "App"
}

export function SiteHeader({ title, subtitle, compact = false }: { title?: string; subtitle?: string; compact?: boolean }) {
  const pathname = usePathname()
  const derived = title ?? deriveTitleFromPath(pathname)

  return (
    <header className="flex w-full shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full flex-col">
        <div className="flex items-center gap-1 px-4 lg:gap-2 lg:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
          <h1 className={compact ? "text-sm font-semibold" : "text-base font-medium"}>{derived}</h1>
          <div className="ml-auto flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <ModeToggle />
          </div>
        </div>
        {subtitle ? (
          <div className="px-4 lg:px-6">
            <div className="text-sm text-[var(--text-secondary)] mt-1">{subtitle}</div>
          </div>
        ) : null}
      </div>
    </header>
  )
}
