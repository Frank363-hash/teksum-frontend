import type { Metadata } from "next"
import { PublicShell } from "@/components/public-shell"

export const metadata: Metadata = {
  title: "About TEKSUM",
  description: "Learn about TEKSUM and its wallet-led Nigerian digital services platform.",
  alternates: { canonical: "/about" },
}
export default function About(){return <PublicShell><main className="min-w-0 mx-auto max-w-4xl px-5 py-16 lg:px-8"><p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-500">About TEKSUM</p><h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">A practical place to handle everyday digital services.</h1><p className="mt-6 text-lg leading-8 text-muted-foreground">TEKSUM brings data, airtime, education products, cable TV and electricity payments into one wallet-led experience.</p><div className="mt-10 grid gap-4 sm:grid-cols-2"><div className="rounded-2xl border border-border bg-card p-6"><h2 className="font-bold">Designed around the purchase</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">The experience keeps the purchase flow focused on the service you came to buy.</p></div><div className="rounded-2xl border border-border bg-card p-6"><h2 className="font-bold">Clear before and after payment</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Prices, recipients and transaction states are presented so you can review the purchase before and after payment.</p></div></div></main></PublicShell>}
