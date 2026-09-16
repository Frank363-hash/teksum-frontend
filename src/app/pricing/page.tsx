import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Pricing",
  description: "Review how TEKSUM displays current service rates before you confirm a purchase.",
  alternates: { canonical: "/pricing" },
}
import { ArrowRight } from "lucide-react"
import { PublicShell } from "@/components/public-shell"
export default function PricingPage(){return <PublicShell><main className="min-w-0 mx-auto max-w-5xl px-5 py-16 lg:px-8"><p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-500">Pricing</p><h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">Know what you're paying before you confirm.</h1><p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">TEKSUM uses the latest available service rates. The purchase page shows the current price or amount available after you sign in.</p><div className="mt-8 rounded-2xl border border-border bg-card p-6"><p className="font-bold">See the latest rates before you pay.</p><p className="mt-2 text-sm leading-6 text-muted-foreground">Sign in to see the latest rates available for the services you want. You’ll see the amount before you confirm your purchase.</p><Link href="/sign-in" className="mt-5 inline-flex items-center text-sm font-bold text-emerald-500">Sign in to see available rates <ArrowRight className="ml-1 size-4"/></Link></div></main></PublicShell>}
