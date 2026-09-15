import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Digital Services",
  description: "Explore TEKSUM data, airtime, cable TV, electricity and education services.",
  alternates: { canonical: "/services" },
}
import { ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { ServiceVisual } from "@/components/teksum/service-visual"
import { PublicShell } from "@/components/public-shell"

const services = [
  ["data", "Data", "MTN, Airtel, Glo and 9mobile bundles", "data", "/images/services/data.webp"],
  ["airtime", "Airtime", "Recharge supported Nigerian numbers", "airtime", "/images/services/airtime.webp"],
  ["education", "Education", "WAEC, NECO, NABTEB and JAMB products", "education", "/images/services/education.webp"],
  ["cable", "Cable TV", "DStv, GOtv, Startimes and supported services", "cable", "/images/services/cable.webp"],
  ["power", "Electricity", "Supported Nigerian electricity providers", "power", "/images/services/electricity.webp"],
  ["airtime-pin", "Airtime PIN", "Recharge-card PINs available for purchase", "airtime-pin", "/images/services/airtime-pin.webp"],
  ["international-airtime", "International Airtime", "International top-ups are coming soon", "international-airtime", "/images/services/international-airtime.webp"],
] as const

export default function ServicesPage() { return <PublicShell><main className="min-w-0 mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16"><p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-500">TEKSUM services</p><h1 className="mt-2 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">Pick a service. See how it works. Buy when you're ready.</h1><p className="mt-4 max-w-2xl text-muted-foreground">Browse the options first. Sign in only when you are ready to purchase.</p><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{services.map(([slug,title,desc,icon,image])=><Link key={slug} href={`/services/${slug}`} className="group"><Card className="h-full overflow-hidden rounded-2xl transition hover:-translate-y-0.5 hover:border-emerald-500/40 hover:shadow-lg"><ServiceVisual src={image} alt={`${title} service`} icon={icon} className="h-40 rounded-none border-0 border-b" /><CardContent className="p-6"><div className="flex items-start justify-between gap-3"><div><h2 className="font-bold">{title}</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">{desc}</p></div>{slug === "international-airtime" && <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold text-amber-600">Coming soon</span>}</div><span className="mt-5 inline-flex items-center text-sm font-bold text-emerald-500">View service <ArrowRight className="ml-1 size-4"/></span></CardContent></Card></Link>)}</div></main></PublicShell> }
