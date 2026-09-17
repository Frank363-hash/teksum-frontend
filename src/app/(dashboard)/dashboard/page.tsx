"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Plus,
  Smartphone,
  Radio,
  GraduationCap,
  Tv,
  WalletCards,
  ShieldCheck,
  KeyRound,
  Globe2,
  MailCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getProfile,
  getTransactions,
  getWallet,
  formatDate,
  formatNaira,
  Transaction,
} from "@/lib/teksum-api";

const services = [
  ["Buy Data", "Fast network data bundles", "/dashboard/data", Radio],
  [
    "Airtime VTU",
    "Recharge any Nigerian line",
    "/dashboard/airtime",
    Smartphone,
  ],
  ["Exam PINs", "WAEC, NECO & NABTEB", "/dashboard/exam-pins", GraduationCap],
  [
    "Cable TV & Power",
    "TV subscriptions & electricity",
    "/dashboard/bills",
    Tv,
  ],
  [
    "Wallet & Funding",
    "Fund your TEKSUM wallet securely",
    "/dashboard/wallet",
    WalletCards,
  ],
  [
    "Airtime PIN",
    "Recharge-card PIN products",
    "/dashboard/airtime-pin",
    KeyRound,
  ],
  [
    "International Airtime",
    "Coming soon",
    "/dashboard/international-airtime",
    Globe2,
  ],
] as const;

export default function Dashboard() {
  const [wallet, setWallet] = useState<{ balance: string } | null>(null);
  const [profile, setProfile] = useState<{
    fullName: string | null;
    email: string;
    isVerified: boolean;
  } | null>(null);
  const [tx, setTx] = useState<Transaction[]>([]);
  const [showBalance, setShowBalance] = useState(true);
  const [isFirstDashboardVisit, setIsFirstDashboardVisit] = useState<
    boolean | null
  >(null);
  useEffect(() => {
    Promise.all([getWallet(), getProfile(), getTransactions("limit=6")])
      .then(([w, p, t]) => {
        setWallet(w);
        setProfile(p);
        setTx(t.items);
        try {
          const key = `teksum:dashboard-seen:${p.email.toLowerCase()}`;
          const seen = window.localStorage.getItem(key) === "1";
          setIsFirstDashboardVisit(!seen);
          window.localStorage.setItem(key, "1");
        } catch {
          setIsFirstDashboardVisit(false);
        }
      })
      .catch(() => {});
  }, []);
  return (
    <div className="teksum-dashboard-page min-w-0 w-full flex flex-1 flex-col gap-6">
      {profile && !profile.isVerified && (
        <section className="rounded-2xl border border-amber-500/30 bg-amber-500/[.06] p-4 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <MailCheck className="mt-0.5 size-5 shrink-0 text-amber-500" />
              <div>
                <p className="font-bold">Verify your email</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Verify your email to unlock wallet and purchase services.
                </p>
              </div>
            </div>
            <Button
              render={
                <Link
                  href={`/verify-email?email=${encodeURIComponent(profile.email)}&redirect=/dashboard`}
                />
              }
              className="shrink-0 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Verify email
            </Button>
          </div>
        </section>
      )}
      <section className="rounded-2xl border bg-card p-6 shadow-sm lg:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-500">
              TEKSUM wallet
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">
              {isFirstDashboardVisit ? "Welcome" : "Welcome back"},{" "}
              {profile?.fullName?.trim().split(/\s+/)[0] || "there"}.
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Buy VTU services at competitive rates and keep every transaction
              in one place.
            </p>
          </div>
          <div className="flex w-full gap-2 xl:w-auto">
            <Button
              render={<Link href="/dashboard/wallet" />}
              className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <Plus /> Fund wallet
            </Button>
          </div>
        </div>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="min-w-0 rounded-2xl bg-muted/50 p-5">
            <p className="text-xs text-muted-foreground">Available balance</p>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-3xl font-black tabular-nums">
                {showBalance ? formatNaira(wallet?.balance) : "••••••"}
              </p>
              <button
                type="button"
                onClick={() => setShowBalance((visible) => !visible)}
                className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label={
                  showBalance ? "Hide wallet balance" : "Show wallet balance"
                }
                title={
                  showBalance ? "Hide wallet balance" : "Show wallet balance"
                }
              >
                {showBalance ? (
                  <Eye className="size-4" />
                ) : (
                  <EyeOff className="size-4" />
                )}
              </button>
            </div>
          </div>
          <div className="min-w-0 rounded-2xl border p-5">
            <p className="text-xs text-muted-foreground">Account status</p>
            <p className="mt-1 font-bold">Active & secure</p>
            <div className="mt-2 flex items-center gap-2 text-xs text-emerald-500">
              <ShieldCheck className="size-4" /> Protected account
            </div>
          </div>
          <div className="min-w-0 rounded-2xl border p-5">
            <p className="text-xs text-muted-foreground">Quick action</p>
            <Button
              variant="ghost"
              className="mt-1 h-auto p-0 font-bold"
              render={<Link href="/dashboard/transactions" />}
            >
              View transaction history <ArrowUpRight className="ml-1 size-4" />
            </Button>
          </div>
        </div>
      </section>
      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Services</h2>
            <p className="text-sm text-muted-foreground">
              Everything you need for everyday digital payments.
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {services.map(([title, desc, url, Icon]) => (
            <Link key={url} href={url} className="group">
              <Card className="h-full rounded-2xl transition hover:-translate-y-0.5 hover:shadow-md">
                <CardContent className="p-5">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                    <Icon />
                  </div>
                  <h3 className="mt-4 font-bold">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
                  <span className="mt-4 inline-flex items-center text-xs font-bold text-emerald-500">
                    Open service <ArrowUpRight className="ml-1 size-3" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent transactions</CardTitle>
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/dashboard/transactions" />}
          >
            See all
          </Button>
        </CardHeader>
        <CardContent>
          {tx.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No transactions yet.
            </p>
          ) : (
            <div className="divide-y">
              {tx.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {t.category.replaceAll("_", " ")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t.reference} • {formatDate(t.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold tabular-nums">
                      {formatNaira(t.amount)}
                    </p>
                    <Badge variant="secondary" className="mt-1 text-[10px]">
                      {t.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
