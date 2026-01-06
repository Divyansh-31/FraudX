import { SiteHeader } from "@/components/site-header"
import InfoCard from "@/components/info-card"
import RecentOrdersTable from "@/components/recent-orders-table"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import RevenueOrdersChart from "@/components/revenue-orders-chart"
import { Badge } from "@/components/ui/badge"
import { IconShieldCheck, IconTrendingUp } from "@tabler/icons-react"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

import transactions, { type Transaction } from "@/lib/data"
import { formatINR } from "@/lib/utils"

export default function Page() {
  const revenueProtected = transactions
    .filter((t: Transaction) => t.status === "Blocked")
    .reduce((s: number, t: Transaction) => s + t.amount, 0)

  const highRiskCount = transactions.filter((t: Transaction) => t.riskScore > 80).length

  const avgRisk = (transactions.reduce((s: number, t: Transaction) => s + t.riskScore, 0) / transactions.length) || 0

  const latestFive = transactions
    .slice()
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5)

  const verifiedCount = transactions.filter((t) => t.status === "Verified").length
  const blockedCount = transactions.filter((t) => t.status === "Blocked").length
  const avgAmount = transactions.length ? transactions.reduce((s, t) => s + t.amount, 0) / transactions.length : 0

  return (
    <>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-3">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <div className="mb-3" />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                <InfoCard
                  title="Revenue Protected"
                  value={<span className="tabular-nums">{formatINR(revenueProtected)}</span>}
                  label="Protected revenue to date"
                  className="bg-gradient-to-b from-[rgba(var(--color-primary-rgb),0.18)] to-transparent"
                />

                <InfoCard
                  title="Total Transactions"
                  value={<span className="tabular-nums">{transactions.length}</span>}
                  label="All-time total"
                  className="bg-gradient-to-b from-[rgba(255,255,255,0.03)] to-transparent"
                />

                <InfoCard
                  title="Verified Transactions"
                  value={<span className="tabular-nums text-[var(--color-primary-400)]">{verifiedCount}</span>}
                  label="Confirmed by verification checks"
                  className="bg-gradient-to-b from-[rgba(var(--color-primary-400-rgb),0.12)] to-transparent"
                />

                <InfoCard
                  title="Blocked Transactions"
                  value={<span className="tabular-nums text-[var(--color-alert-400)]">{blockedCount}</span>}
                  label="Blocked by rules/alerts"
                  className="bg-gradient-to-b from-[rgba(var(--color-alert-400-rgb),0.12)] to-transparent"
                />

                <InfoCard
                  title="High Risk Alerts"
                  value={<span className="tabular-nums text-[var(--color-alert-400)]">{highRiskCount}</span>}
                  label="Transactions with risk &gt; 80"
                  className="bg-gradient-to-b from-[rgba(var(--color-alert-400-rgb),0.12)] to-transparent"
                />

                <InfoCard
                  title="Average Amount"
                  value={<span className="tabular-nums">{formatINR(avgAmount)}</span>}
                  label="Average transaction value"
                  className="bg-gradient-to-b from-[rgba(255,255,255,0.03)] to-transparent"
                />
              </div>

              {/* Revenue vs Orders chart card */}
              <div className="mt-5">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg md:text-xl">Revenue vs Orders</CardTitle>
                    <CardDescription>Daily revenue and order count</CardDescription>
                  </CardHeader>
                  <div className="p-3 md:p-4">
                    <RevenueOrdersChart />
                  </div>
                </Card>
              </div>
            </div>

            {/* Recent Orders table (dark mode) */}
            <div className="px-4 lg:px-6">
              <div className="mt-4">
                {/* @ts-ignore - client component */}
                <RecentOrdersTable rows={8} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
