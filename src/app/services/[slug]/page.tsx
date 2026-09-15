import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react"
import { ServiceForm } from "@/components/teksum/service-form"
import { ServiceVisual } from "@/components/teksum/service-visual"
import { PublicShell } from "@/components/public-shell"

const catalog = {
  data: { title: "Buy Data", category: "DATA", icon: "data", image: "/images/services/data.webp", description: "Choose a Nigerian network and an available bundle. The latest prices are shown when you continue.", points: ["MTN, Airtel, Glo and 9mobile", "Network-specific plans", "Live selling prices after sign-in"] },
  airtime: { title: "Buy Airtime", category: "AIRTIME", icon: "airtime", image: "/images/services/airtime.webp", description: "Recharge MTN, Airtel, Glo or 9mobile numbers from your TEKSUM wallet.", points: ["Choose the network and amount", "Buy for any supported Nigerian number", "Protected by your transaction PIN"] },
  cable: { title: "Cable TV", category: "CABLE", icon: "cable", image: "/images/services/cable.webp", description: "Choose your TV provider first, then view the available plans after sign-in.", points: ["DStv, GOtv, Startimes and Showmax where supported", "Plans and prices are shown based on current availability", "Secure wallet checkout"] },
  power: { title: "Electricity", category: "ELECTRICITY", icon: "power", image: "/images/services/electricity.webp", description: "Pay supported electricity providers from your TEKSUM wallet.", points: ["Supported Nigerian distribution companies", "Prepaid and postpaid meter types", "Secure wallet checkout"] },
  "airtime-pin": { title: "Airtime PIN", category: "AIRTIME_PIN", icon: "airtime-pin", image: "/images/services/airtime-pin.webp", description: "Buy recharge-card PIN products currently available on TEKSUM.", points: ["Network options and denominations are shown based on current availability", "Bulk quantity appears when the selected product supports it", "Purchase is protected by your transaction PIN"] },
} as const

type ServiceSlug = keyof typeof catalog

export function generateStaticParams() {
  return Object.keys(catalog).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  if (slug === "international-airtime") {
    return {
      title: "International Airtime: Coming Soon",
      description: "International airtime is coming soon to TEKSUM.",
      alternates: { canonical: "/services/international-airtime" },
    }
  }
  const service = catalog[slug as ServiceSlug]
  if (!service) return {}
  return {
    title: service.title,
    description: service.description,
    alternates: { canonical: `/services/${slug}` },
  }
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (slug === "international-airtime") return <ComingSoon />
  const service = catalog[slug as ServiceSlug]
  if (!service) notFound()
  return <PublicShell><main className="min-w-0 mx-auto max-w-6xl px-5 py-10 lg:px-8 lg:py-12"><div className="flex flex-wrap items-center gap-4 text-sm"><Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground"><ArrowLeft className="mr-2 size-4"/>Home</Link><Link href="/services" className="inline-flex items-center text-muted-foreground hover:text-foreground">All services</Link></div><div className="mt-7 grid gap-10 lg:grid-cols-[.8fr_1.2fr]"><section><ServiceVisual src={service.image} alt={`${service.title} service`} icon={service.icon} className="h-64 sm:h-80"/><p className="mt-7 text-xs font-bold uppercase tracking-[.18em] text-emerald-500">TEKSUM service</p><h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">{service.title}</h1><p className="mt-5 text-lg leading-8 text-muted-foreground">{service.description}</p><div className="mt-7 space-y-3">{service.points.map(p=><div key={p} className="flex items-start gap-3 text-sm text-foreground/80"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500"/>{p}</div>)}</div></section><section><ServiceForm category={service.category} title={service.title} description="Available options are shown after you sign in." publicMode /></section></div></main></PublicShell>
}

function ComingSoon(){return <PublicShell><main className="mx-auto max-w-5xl px-5 py-10 lg:px-8"><div className="flex flex-wrap items-center gap-4 text-sm"><Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground"><ArrowLeft className="mr-2 size-4"/>Home</Link><Link href="/services" className="inline-flex items-center text-muted-foreground hover:text-foreground">All services</Link></div><div className="mt-10 grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center"><ServiceVisual src="/images/services/international-airtime.webp" alt="International airtime" icon="international-airtime" className="h-72"/><section><span className="inline-flex rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600">Coming soon</span><h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">International Airtime</h1><p className="mt-4 max-w-xl text-lg leading-8 text-muted-foreground">International top-ups are on the way. We will make them available here when the service is ready.</p><div className="mt-7 rounded-2xl border bg-card p-5"><p className="font-semibold">Nothing to buy here yet.</p><p className="mt-1 text-sm text-muted-foreground">We won't show options that are not ready for purchase.</p></div><Link href="/services" className="mt-6 inline-flex items-center text-sm font-bold text-emerald-500">Browse available services <ArrowRight className="ml-1 size-4"/></Link></section></div></main></PublicShell>}
