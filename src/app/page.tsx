import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Data, Airtime, Bills & Exam PINs in One Wallet",
  description: "Buy data, airtime, exam PINs and supported Nigerian bills with TEKSUM.",
  alternates: { canonical: "/" },
};
import {
  ArrowRight,
  CheckCircle2,
  Globe2,
  GraduationCap,
  KeyRound,
  Radio,
  Smartphone,
  Tv,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PublicPreview } from "@/components/teksum/public-preview";
import { ServiceVisual } from "@/components/teksum/service-visual";
import { PublicShell } from "@/components/public-shell";

const services = [
  [
    "data",
    "Data",
    "The bundle you need. Right number. Right now.",
    Radio,
    "/images/services/data.webp",
  ],
  [
    "airtime",
    "Airtime",
    "Top up and get on with your day.",
    Smartphone,
    "/images/services/airtime.webp",
  ],
  [
    "education",
    "Education",
    "Get the PIN. Keep moving.",
    GraduationCap,
    "/images/services/education.webp",
  ],
  [
    "cable",
    "Cable TV",
    "Renew your TV before the next programme starts.",
    Tv,
    "/images/services/cable.webp",
  ],
  [
    "power",
    "Electricity",
    "Keep the lights on without the runaround.",
    Zap,
    "/images/services/electricity.webp",
  ],
  [
    "airtime-pin",
    "Airtime PIN",
    "Recharge-card PINs available for purchase.",
    KeyRound,
    "/images/services/airtime-pin.webp",
  ],
  [
    "international-airtime",
    "International Airtime",
    "International top-ups are coming soon.",
    Globe2,
    "/images/services/international-airtime.webp",
  ],
] as const;

export default function Home() {
  return (
    <PublicShell>
      <main className="min-w-0">
        <section className="relative overflow-hidden bg-background text-foreground">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(16,185,129,.18),transparent_34%),radial-gradient(circle_at_18%_82%,rgba(16,185,129,.08),transparent_30%)]" />
          <div className="relative mx-auto grid min-w-0 max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-24">
            <div className="min-w-0 flex flex-col justify-center">
              <p className="text-xs font-bold uppercase tracking-[.22em] text-emerald-500">
                Data • Airtime • Bills • Education
              </p>
              <h1 className="mt-4 max-w-3xl text-5xl font-black tracking-[-.045em] sm:text-6xl">
                Buy Instant Data, Airtime & Exam PINs at Wholesale Rates.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-foreground/60">
                One wallet for everyday digital services. Explore what TEKSUM
                supports, then sign in when you're ready to pay.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="rounded-xl bg-emerald-500 text-black hover:bg-emerald-400"
                  render={<Link href="/services" />}
                >
                  Explore services <ArrowRight />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-xl border-border bg-background/70 text-foreground hover:bg-muted"
                  render={<Link href="/sign-up" />}
                >
                  Create account
                </Button>
              </div>
              <div className="mt-8 flex flex-wrap gap-5 text-sm text-foreground/60">
                <span>
                  <CheckCircle2 className="mr-1 inline size-4 text-emerald-400" />
                  Wallet-funded checkout
                </span>
                <span>
                  <CheckCircle2 className="mr-1 inline size-4 text-emerald-400" />
                  Current service options
                </span>
              </div>
            </div>
            <div className="min-w-0"><PublicPreview /></div>
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-500">
                Get things done
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight">
                The services you actually came for.
              </h2>
            </div>
            <Link
              href="/services"
              className="text-sm font-bold text-emerald-500"
            >
              See all services <ArrowRight className="ml-1 inline size-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map(([slug, title, desc, , image]) => (
              <Link key={slug} href={`/services/${slug}`} className="group">
                <Card className="h-full overflow-hidden rounded-2xl transition hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-lg">
                  <ServiceVisual
                    src={image}
                    alt={`${title} service`}
                    icon={slug}
                    className="h-32 rounded-none border-0 border-b"
                  />
                  <CardContent className="p-6">
                    <h3 className="font-bold">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {desc}
                    </p>
                    <span className="mt-5 inline-flex items-center text-xs font-bold text-emerald-500">
                      View service <ArrowRight className="ml-1 size-3" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
        <section className="border-y bg-muted/30">
          <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
            <div className="grid gap-8 md:grid-cols-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-500">
                  How it works
                </p>
                <h2 className="mt-2 text-3xl font-black">
                  Simple from service to receipt.
                </h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 md:col-span-2">
                {[
                  ["01", "Choose", "Pick a service and the option you need."],
                  [
                    "02",
                    "Review",
                    "Check the recipient, product and amount before paying.",
                  ],
                  [
                    "03",
                    "Confirm",
                    "Use your transaction PIN and follow the status to completion.",
                  ],
                ].map(([n, h, b]) => (
                  <div key={n} className="rounded-2xl border bg-card p-5">
                    <span className="text-xs font-bold text-emerald-500">
                      {n}
                    </span>
                    <p className="mt-3 font-bold">{h}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{b}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-500">
            Questions
          </p>
          <h2 className="mt-2 text-3xl font-black">Before you get started.</h2>
          <div className="mt-7 space-y-3">
            {[
              [
                "Do I need an account to browse?",
                "No. Explore the public service pages first. Sign in or create an account when you're ready to purchase.",
              ],
              [
                "Where do prices come from?",
                "Prices shown for purchases are based on the latest rates available on TEKSUM. If a price is not available yet, we will let you know.",
              ],
              [
                "What happens if a transaction is pending?",
                "Pending means TEKSUM is still confirming the transaction. Check Transactions rather than submitting the same purchase again.",
              ],
            ].map(([q, a]) => (
              <details key={q} className="rounded-2xl border bg-card p-5">
                <summary className="cursor-pointer font-bold">{q}</summary>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {a}
                </p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
