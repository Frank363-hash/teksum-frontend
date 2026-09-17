"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, ChevronLeft, ChevronRight, Clock3, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getTransactions,
  Transaction,
  formatDate,
  formatNaira,
  customerMessage,
} from "@/lib/teksum-api";
function Status({ status }: { status: string }) {
  const s = status.toUpperCase();
  if (s === "SUCCESS")
    return (
      <Badge className="bg-emerald-500/10 text-emerald-600">
        <CheckCircle2 className="mr-1 size-3" />
        Success
      </Badge>
    );
  if (s === "PENDING")
    return (
      <Badge className="bg-amber-500/10 text-amber-600">
        <Clock3 className="mr-1 size-3" />
        Pending
      </Badge>
    );
  return (
    <Badge className="bg-destructive/10 text-destructive">
      <XCircle className="mr-1 size-3" />
      Failed
    </Badge>
  );
}
export default function Page() {
  const [tx, setTx] = useState<Transaction[]>([]);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  useEffect(() => {
    setError("");
    const query = new URLSearchParams({ page: String(page), limit: "20" });
    if (status) query.set("status", status);
    getTransactions(query.toString())
      .then((r) => {
        setTx(r.items);
        setPages(Math.max(1, r.pagination.pages));
        setTotal(r.pagination.total);
      })
      .catch((e) =>
        setError(
          customerMessage(e, "We couldn't load your transactions right now."),
        ),
      );
  }, [status, page]);
  return (
    <div className="teksum-dashboard-page min-w-0 w-full">
      <Card className="min-w-0 overflow-hidden rounded-2xl">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Transactions</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Your complete TEKSUM transaction history.
            </p>
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-9 rounded-lg border bg-background px-3 text-sm"
          >
            <option value="">All statuses</option>
            <option>SUCCESS</option>
            <option>PENDING</option>
            <option>FAILED</option>
          </select>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="mb-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="hidden min-w-0 md:block">
            <div className="w-full min-w-0">
              <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_90px_100px_150px] gap-3 border-b pb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <span>Transaction</span>
                <span>Status</span>
                <span className="text-right">Amount</span>
                <span className="text-right">Date</span>
              </div>
              {tx.map((t) => (
                <Link
                  href={`/dashboard/transactions/${t.reference}`}
                  key={t.id}
                  className="grid min-w-0 grid-cols-[minmax(0,1fr)_90px_100px_150px] items-center gap-3 border-b py-4 last:border-0 hover:bg-muted/30"
                >
                  <div>
                    <p className="font-semibold">
                      {t.category.replaceAll("_", " ")}
                    </p>
                    <p
                      className="truncate font-mono text-xs text-muted-foreground"
                      title={t.reference}
                    >
                      {t.reference}
                    </p>
                  </div>
                  <Status status={t.status} />
                  <p className="text-right font-bold">
                    {formatNaira(t.amount)}
                  </p>
                  <p className="text-right text-xs text-muted-foreground">
                    {formatDate(t.createdAt)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
          <div className="space-y-2 md:hidden">
            {tx.map((t) => (
              <Link
                href={`/dashboard/transactions/${t.reference}`}
                key={t.id}
                className="block rounded-2xl border p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold">
                      {t.category.replaceAll("_", " ")}
                    </p>
                    <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
                      {t.reference}
                    </p>
                  </div>
                  <ArrowUpRight className="size-4 text-muted-foreground" />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <Status status={t.status} />
                  <span className="font-bold">{formatNaira(t.amount)}</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {formatDate(t.createdAt)}
                </p>
              </Link>
            ))}
            {tx.length === 0 && (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No transactions found.
              </p>
            )}
          </div>
          {pages > 1 && (
            <div className="mt-5 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                Page {page} of {pages} · {total.toLocaleString("en-NG")} transactions
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  aria-label="Previous transactions page"
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page >= pages}
                  onClick={() => setPage((current) => Math.min(pages, current + 1))}
                  aria-label="Next transactions page"
                >
                  Next
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
