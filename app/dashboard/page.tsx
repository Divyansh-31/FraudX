import { SiteHeader } from "@/components/site-header"
import TransactionTable from "@/components/transaction-table"
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

  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            {/* Metrics + Chart Row */}
            <div className="px-4 lg:px-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardDescription>Revenue Protected</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums">
                      ${revenueProtected.toFixed(2)}
                    </CardTitle>
                  </CardHeader>
                  <CardFooter>
                    <Badge variant="outline">
                      <IconShieldCheck className="size-4" />
                      Protected
                    </Badge>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardDescription>Total Transactions</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums">{transactions.length}</CardTitle>
                  </CardHeader>
                  <CardFooter>
                    <div className="text-sm text-muted-foreground">Total transactions</div>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardDescription>High Risk Alerts</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums">{highRiskCount}</CardTitle>
                  </CardHeader>
                  <CardFooter>
                    <Badge variant="outline">
                      <IconTrendingUp className="size-4" />
                      Critical
                    </Badge>
                  </CardFooter>
                </Card>

                {/* Active Shields card removed per request */}
              </div>

              {/* Revenue vs Orders chart */}
              <div className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue vs Orders</CardTitle>
                    <CardDescription>Daily revenue and order count</CardDescription>
                  </CardHeader>
                  <div className="p-4">
                    <RevenueOrdersChart />
                  </div>
                </Card>
              </div>
            </div>

            {/* Transaction table */}
            <div className="px-4 lg:px-6">
              <TransactionTable data={latestFive} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
