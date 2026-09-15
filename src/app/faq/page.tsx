import type { Metadata } from "next"
import { PublicShell } from "@/components/public-shell"

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Answers about TEKSUM services, pricing, accounts, transaction PINs and pending transactions.",
  alternates: { canonical: "/faq" },
}
const faqs=[['What services does TEKSUM support?','TEKSUM currently offers data, airtime, education PINs, cable TV, electricity and airtime PINs. International airtime is coming soon.'],['Do I need an account to browse?','No. You can browse the public service information. Authentication is required before wallet-funded purchases.'],['Why are some prices only shown after sign-in?','Some prices are shown after sign-in so we can confirm the latest available rate before you purchase. We do not display made-up prices.'],['What protects purchases?','Authenticated purchases require a 4-digit transaction PIN. TEKSUM also uses safeguards to help prevent accidental duplicate purchases.'],['What if my transaction is pending?','Leave it alone while it is being confirmed. Check your transaction history rather than submitting the same purchase again.']]
export default function FAQPage(){return <PublicShell><main className="min-w-0 mx-auto max-w-3xl px-5 py-16 lg:px-8"><p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-500">FAQ</p><h1 className="mt-2 text-4xl font-black tracking-tight">Answers before you buy.</h1><div className="mt-8 space-y-3">{faqs.map(([q,a])=><details key={q} className="rounded-2xl border border-border bg-card p-5"><summary className="cursor-pointer font-bold">{q}</summary><p className="mt-3 text-sm leading-6 text-muted-foreground">{a}</p></details>)}</div></main></PublicShell>}
