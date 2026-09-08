"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Banknote,
  CheckCircle2,
  CircleAlert,
  Clock3,
  DollarSign,
  RefreshCw,
  ReceiptText,
  Server,
  ShoppingCart,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiFetch, formatDate, formatNaira } from "@/lib/teksum-api"

type AdminTransaction = {
  id: string
  reference: string
  userId?: string | null
  type: string
  category: string
  amount: string
  fee?: string
  status: string
  providerName?: string | null
  providerRef?: string | null
  createdAt: string
  metadata?: Record<string, unknown> | null
}

type VendorBalance = {
  provider: string
  status: "OK" | "LOW" | "ERROR" | string
  balanceNGN?: string
  error?: string
}

type DashboardData = {
  users?: { total?: number; active?: number; suspended?: number }
  financials?: {
    totalUserWalletBalances?: string
    totalSalesToday?: string
    netProfitMarginToday?: string
  }
  vendorBalances?: VendorBalance[]
}

type TransactionPage = {
  items: AdminTransaction[]
  page: number
  limit: number
  total: number
  pages: number
}

type ReconciliationItem = {
  id: string
  transactionId: string
  providerName?: string | null
  providerRef?: string | null
  reason: string
  status: string
  lastError?: string | null
  createdAt: string
}

const VENDING_CATEGORIES = [
  "AIRTIME",
  "DATA",
  "CABLE",
  "ELECTRICITY",
  "FOREIGN_AIRTIME",
  "EDUCATION_PIN",
  "AIRTIME_PIN",
]

const money = (value: unknown) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function transactionCost(transaction: AdminTransaction) {
  const value = transaction.metadata?.costPrice
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function transactionMargin(transaction: AdminTransaction) {
  const cost = transactionCost(transaction)
  return cost === null ? null : money(transaction.amount) - cost
}

async function getTransactionPage(query: string) {
  return apiFetch<TransactionPage>(`/api/v1/admin/transactions?${query}`)
}

async function getAllTransactions(query: string, stopAt?: Date) {
  const all: AdminTransaction[] = []
  let page = 1
  let pages = 1

  while (page <= pages) {
    const params = new URLSearchParams(query)
    params.set("page", String(page))
    params.set("limit", "100")
    const result = await getTransactionPage(params.toString())
    all.push(...result.items)
    pages = result.pages

    if (stopAt && result.items.length) {
      const oldest = result.items[result.items.length - 1]
      if (new Date(oldest.createdAt) < stopAt) break
    }
    page += 1
  }

  return all
}

async function getCategoryStatusTotals(category: string, status: string) {
  const result = await getTransactionPage(
    new URLSearchParams({ category, status, page: "1", limit: "100" }).toString(),
  )
  return { total: result.total, items: result.items, pages: result.pages }
}

function MetricCard({
  label,
  value,
  note,
  icon: Icon,
}: {
  label: string
  value: string
  note?: string
  icon: typeof Activity
}) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="p-5">
        <Icon className="size-5 text-emerald-500" />
        <p className="mt-4 text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-black tabular-nums tracking-tight">{value}</p>
        {note && <p className="mt-1 text-xs text-muted-foreground">{note}</p>}
      </CardContent>
    </Card>
  )
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase()
  const className =
    normalized === "SUCCESS"
      ? "text-emerald-600"
      : normalized === "FAILED" || normalized === "ERROR"
        ? "text-destructive"
        : normalized === "PENDING" || normalized === "LOW"
          ? "text-amber-600"
          : "text-muted-foreground"
  return <Badge variant="secondary" className={className}>{normalized}</Badge>
}

function ProviderBalance({ item }: { item: VendorBalance }) {
  const error = item.status.toUpperCase() === "ERROR"
  return (
    <div className="rounded-xl border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold">{item.provider}</p>
          <p className="mt-1 text-xs text-muted-foreground">Operational provider account</p>
        </div>
        <StatusBadge status={item.status} />
      </div>
      <div className="mt-4 flex min-w-0 flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">Current balance</p>
          <p className="mt-1 text-xl font-black tabular-nums">
            {error ? "ERROR" : formatNaira(item.balanceNGN)}
          </p>
        </div>
        <p className="min-w-0 max-w-sm break-words text-right text-xs text-muted-foreground">
          {error
            ? item.error || "Provider balance could not be retrieved."
            : item.status.toUpperCase() === "LOW"
              ? "Below configured low-balance threshold."
              : "Above configured low-balance threshold."}
        </p>
      </div>
    </div>
  )
}

export default function Admin() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [todayVending, setTodayVending] = useState<AdminTransaction[]>([])
  const [recent, setRecent] = useState<AdminTransaction[]>([])
  const [todayFundingTransactions, setTodayFundingTransactions] = useState<AdminTransaction[]>([])
  const [pendingFunding, setPendingFunding] = useState<AdminTransaction[]>([])
  const [successfulFunding, setSuccessfulFunding] = useState<AdminTransaction[]>([])
  const [pendingVendingCount, setPendingVendingCount] = useState(0)
  const [pendingTransactionCount, setPendingTransactionCount] = useState(0)
  const [failedTransactionCount, setFailedTransactionCount] = useState(0)
  const [reconciliation, setReconciliation] = useState<ReconciliationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const startOfToday = new Date()
      startOfToday.setHours(0, 0, 0, 0)

      const [dashboard, recentPage, pendingAll, failedAll, openRecon, todayTransactions, todayFundingTransactions, pendingFundingFirst, successfulFundingFirst] =
        await Promise.all([
          apiFetch<DashboardData>("/api/v1/admin/dashboard"),
          getTransactionPage("page=1&limit=12"),
          getTransactionPage("page=1&limit=1&status=PENDING"),
          getTransactionPage("page=1&limit=1&status=FAILED"),
          apiFetch<ReconciliationItem[]>("/api/v1/admin/reconciliation?status=OPEN"),
          getAllTransactions("page=1", startOfToday),
          getAllTransactions("category=WALLET_FUNDING", startOfToday),
          getCategoryStatusTotals("WALLET_FUNDING", "PENDING"),
          getCategoryStatusTotals("WALLET_FUNDING", "SUCCESS"),
        ])

      const fundingItems = async (first: { items: AdminTransaction[]; pages: number }, status: string) => {
        if (first.pages <= 1) return first.items
        const rest = await getAllTransactions(`category=WALLET_FUNDING&status=${status}`)
        return rest
      }

      const [allPendingFunding, allSuccessfulFunding, pendingVendingTotals] = await Promise.all([
        fundingItems(pendingFundingFirst, "PENDING"),
        fundingItems(successfulFundingFirst, "SUCCESS"),
        Promise.all(
          VENDING_CATEGORIES.map(async (category) => {
            const result = await getTransactionPage(
              new URLSearchParams({ category, status: "PENDING", page: "1", limit: "1" }).toString(),
            )
            return result.total
          }),
        ),
      ])

      setData(dashboard)
      setRecent(recentPage.items)
      setTodayVending(todayTransactions.filter((tx) => tx.type === "DEBIT_VEND" && tx.status === "SUCCESS"))
      setTodayFundingTransactions(todayFundingTransactions.filter((tx) => tx.category === "WALLET_FUNDING"))
      setPendingFunding(allPendingFunding)
      setSuccessfulFunding(allSuccessfulFunding)
      setPendingTransactionCount(pendingAll.total)
      setFailedTransactionCount(failedAll.total)
      setPendingVendingCount(pendingVendingTotals.reduce((sum, value) => sum + value, 0))
      setReconciliation(openRecon)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load the business command center.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load().catch(() => {})
  }, [load])

  const providerCostToday = useMemo(
    () => todayVending.reduce((sum, tx) => sum + (transactionCost(tx) ?? 0), 0),
    [todayVending],
  )
  const missingCostToday = useMemo(
    () => todayVending.filter((tx) => transactionCost(tx) === null).length,
    [todayVending],
  )
  const successfulVendingToday = todayVending.length
  const todaySales = money(data?.financials?.totalSalesToday)
  const backendGrossMargin = money(data?.financials?.netProfitMarginToday)
  const walletHoldings = money(data?.financials?.totalUserWalletBalances)
  const todayFunding = useMemo(
    () => todayFundingTransactions.reduce((sum, tx) => sum + money(tx.amount), 0),
    [todayFundingTransactions],
  )
  const pendingFundingAmount = useMemo(() => pendingFunding.reduce((sum, tx) => sum + money(tx.amount), 0), [pendingFunding])
  const successfulFundingAmount = useMemo(() => successfulFunding.reduce((sum, tx) => sum + money(tx.amount), 0), [successfulFunding])

  const alerts = useMemo(() => {
    const items: Array<{ key: string; tone: "error" | "warning"; title: string; detail: string }> = []
    for (const provider of data?.vendorBalances || []) {
      if (provider.status.toUpperCase() === "ERROR") {
        items.push({ key: `provider-error-${provider.provider}`, tone: "error", title: `${provider.provider} API error`, detail: provider.error || "Provider balance API returned an error." })
      } else if (provider.status.toUpperCase() === "LOW") {
        items.push({ key: `provider-low-${provider.provider}`, tone: "warning", title: `${provider.provider} balance is low`, detail: "The configured low-balance threshold has been reached." })
      }
    }
    if (pendingFunding.length) items.push({ key: "pending-funding", tone: "warning", title: "Pending wallet funding", detail: `${pendingFunding.length} funding transaction(s) are awaiting confirmation.` })
    if (pendingVendingCount) items.push({ key: "pending-vending", tone: "warning", title: "Pending vending transactions", detail: `${pendingVendingCount} service purchase(s) are still pending.` })
    if (reconciliation.length) items.push({ key: "reconciliation", tone: "error", title: "Reconciliation requires attention", detail: `${reconciliation.length} open reconciliation item(s) need review.` })
    return items
  }, [data?.vendorBalances, pendingFunding.length, pendingVendingCount, reconciliation.length])

  return (
    <div className="teksum-admin-page min-w-0 w-full space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-500">Business command center</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">System Overview</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">See the customer money flow, sales performance, provider operations and exceptions in one place.</p>
        </div>
        <Button variant="outline" onClick={() => load()} disabled={loading} className="w-fit">
          <RefreshCw className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {error && <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</div>}

      <section>
        <div className="mb-4 flex items-center gap-2"><TrendingUp className="size-5 text-emerald-500" /><h2 className="text-lg font-bold">Business Performance</h2></div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <MetricCard label="Today's Revenue / Customer Sales" value={formatNaira(todaySales)} note="Successful service sales today" icon={DollarSign} />
          <MetricCard label="Today's Provider Cost" value={missingCostToday ? "—" : formatNaira(providerCostToday)} note={missingCostToday ? `${missingCostToday} successful sale(s) have no recorded cost` : "Recorded provider cost from successful vending"} icon={Banknote} />
          <MetricCard label="Today's Gross Margin" value={formatNaira(backendGrossMargin)} note="Selling price minus recorded provider cost" icon={TrendingUp} />
          <MetricCard label="Successful Transactions Today" value={successfulVendingToday.toLocaleString("en-NG")} icon={CheckCircle2} />
          <MetricCard label="Pending Transactions" value={pendingTransactionCount.toLocaleString("en-NG")} note="All current transaction categories" icon={Clock3} />
          <MetricCard label="Failed Transactions" value={failedTransactionCount.toLocaleString("en-NG")} note="All current transaction categories" icon={CircleAlert} />
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2"><WalletCards className="size-5 text-emerald-500" /><h2 className="text-lg font-bold">Customer Money</h2></div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Customer Wallet Holdings" value={formatNaira(walletHoldings)} note="Customer funds — not company revenue" icon={WalletCards} />
          <MetricCard label="Today's Wallet Funding" value={formatNaira(todayFunding)} note="Customer funds entering wallets" icon={Banknote} />
          <MetricCard label="Pending Wallet Funding" value={formatNaira(pendingFundingAmount)} note={`${pendingFunding.length.toLocaleString("en-NG")} pending transaction(s)`} icon={Clock3} />
          <MetricCard label="Successful Wallet Funding" value={formatNaira(successfulFundingAmount)} note={`${successfulFunding.length.toLocaleString("en-NG")} successful transaction(s)`} icon={CheckCircle2} />
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2"><Server className="size-5 text-emerald-500" /><div><h2 className="text-lg font-bold">Provider Operations</h2><p className="text-xs text-muted-foreground">Balances are operational provider balances, separate from customer wallets.</p></div></div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(data?.vendorBalances || []).map((provider) => <ProviderBalance key={provider.provider} item={provider} />)}
          {!data?.vendorBalances?.length && <Card className="rounded-2xl"><CardContent className="p-6 text-sm text-muted-foreground">No provider balance data returned.</CardContent></Card>}
        </div>
      </section>

      <section>
        <Card className="rounded-2xl">
          <CardHeader><div className="flex items-center gap-2"><Activity className="size-5 text-emerald-500" /><div><CardTitle className="text-base">Business Flow</CardTitle><p className="mt-1 text-xs font-normal text-muted-foreground">How a funded customer purchase becomes a provider fulfilment and margin event.</p></div></div></CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
              {["Customer funds wallet", "Customer wallet balance", "Customer purchases service", "TEKSUM records sale", "Provider fulfils service", "Provider cost → TEKSUM gross margin"].map((step, index) => (
                <div key={step} className="flex items-center gap-3 md:block">
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-sm font-black text-emerald-600">{index + 1}</div>
                  <p className="min-w-0 break-words text-sm font-semibold md:mt-3">{step}</p>
                  {index < 5 && <ArrowRight className="ml-auto hidden size-4 text-muted-foreground xl:block" />}
                </div>
              ))}
            </div>
            <p className="mt-5 rounded-xl bg-muted/50 p-4 text-xs leading-5 text-muted-foreground">Customer wallet money is not shown as provider funding. TEKSUM debits the customer's wallet for the selling price, records the sale, and the configured provider is called separately for fulfilment at the recorded provider cost.</p>
          </CardContent>
        </Card>
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2"><ReceiptText className="size-5 text-emerald-500" /><h2 className="text-lg font-bold">Recent Activity</h2></div>
        <Card className="rounded-2xl">
          <CardContent className="p-0">
            <div className="hidden overflow-x-auto md:block"><div className="min-w-[980px]"><div className="grid grid-cols-[110px_1.1fr_120px_100px_120px_120px_120px] gap-3 border-b px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"><span>Time</span><span>Service</span><span>Amount</span><span>Status</span><span>Provider</span><span>Provider cost</span><span>Gross margin</span></div>{recent.map((tx) => { const cost = transactionCost(tx); const margin = transactionMargin(tx); return <div key={tx.id} className="grid grid-cols-[110px_1.1fr_120px_100px_120px_120px_120px] gap-3 border-b px-5 py-4 text-sm last:border-0"><span className="text-xs text-muted-foreground">{formatDate(tx.createdAt)}</span><span className="font-medium">{tx.category.replaceAll("_", " ")}</span><span className="font-bold">{formatNaira(tx.amount)}</span><StatusBadge status={tx.status}/><span className="truncate text-xs">{tx.providerName || "—"}</span><span className="text-xs">{cost === null ? "—" : formatNaira(cost)}</span><span className="text-xs font-semibold">{margin === null ? "—" : formatNaira(margin)}</span></div> })}{!recent.length && <p className="p-8 text-center text-sm text-muted-foreground">No recent transactions returned.</p>}</div></div>
            <div className="space-y-3 p-4 md:hidden">{recent.map((tx) => { const cost = transactionCost(tx); const margin = transactionMargin(tx); return <div key={tx.id} className="rounded-xl border p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="break-words font-semibold">{tx.category.replaceAll("_", " ")}</p><p className="mt-1 break-words text-xs text-muted-foreground">{formatDate(tx.createdAt)}</p></div><StatusBadge status={tx.status}/></div><div className="mt-4 grid grid-cols-2 gap-3 text-xs"><div><p className="text-muted-foreground">Amount</p><p className="mt-1 font-bold">{formatNaira(tx.amount)}</p></div><div><p className="text-muted-foreground">Provider</p><p className="mt-1 break-words font-medium">{tx.providerName || "—"}</p></div><div><p className="text-muted-foreground">Provider cost</p><p className="mt-1 font-medium">{cost === null ? "—" : formatNaira(cost)}</p></div><div><p className="text-muted-foreground">Gross margin</p><p className="mt-1 font-medium">{margin === null ? "—" : formatNaira(margin)}</p></div></div></div> })}{!recent.length && <p className="p-8 text-center text-sm text-muted-foreground">No recent transactions returned.</p>}</div>
          </CardContent>
        </Card>
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2"><AlertTriangle className="size-5 text-amber-500" /><h2 className="text-lg font-bold">Alerts</h2></div>
        <Card className="rounded-2xl"><CardContent className="p-4">
          {alerts.length ? <div className="space-y-3">{alerts.map((alert) => <div key={alert.key} className={`flex min-w-0 gap-3 rounded-xl border p-4 ${alert.tone === "error" ? "border-destructive/30 bg-destructive/5" : "border-amber-500/20 bg-amber-500/5"}`}><AlertTriangle className={`mt-0.5 size-5 shrink-0 ${alert.tone === "error" ? "text-destructive" : "text-amber-500"}`} /><div className="min-w-0"><p className="break-words font-semibold">{alert.title}</p><p className="mt-1 break-words text-xs text-muted-foreground">{alert.detail}</p></div></div>)}</div> : <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm"><CheckCircle2 className="size-5 text-emerald-500" />No current provider, funding, vending or reconciliation alerts.</div>}
        </CardContent></Card>
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2"><Users className="size-5 text-emerald-500" /><h2 className="text-lg font-bold">Command Center Shortcuts</h2></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Vendor Balances", "Provider operations", "/admin/vendors", Server],
            ["Financial Audit", "Detailed transaction audit", "/admin/transactions", ReceiptText],
            ["User Management", "Customer management", "/admin/users", Users],
            ["System Settings", "System configuration", "/admin/settings", ShoppingCart],
          ].map(([title, description, href, Icon]) => <Link key={String(href)} href={String(href)} className="group rounded-2xl border bg-card p-4 transition hover:border-emerald-500/40"><div className="flex items-center justify-between"><Icon className="size-5 text-emerald-500" /><ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-1" /></div><p className="mt-4 font-bold">{String(title)}</p><p className="mt-1 text-xs text-muted-foreground">{String(description)}</p></Link>)}
        </div>
      </section>
    </div>
  )
}
