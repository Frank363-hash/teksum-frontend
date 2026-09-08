import Link from "next/link"
import { ArrowRight, GraduationCap, Tv } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { ServiceVisual } from "@/components/teksum/service-visual"

export const educationProviders = [
  { slug: "waec", name: "WAEC", image: "/images/providers/waec.png", products: [["result-checking-pin", "Result Checking PIN", "waec:1"], ["gce-registration-pin", "GCE Registration PIN", "waec:2"], ["verification-pin", "Verification PIN", "waec:3"]] },
  { slug: "neco", name: "NECO", image: "/images/providers/neco.png", products: [["result-checking-token", "Result Checking Token", "neco:1"], ["gce-registration-pin", "GCE Registration PIN", "neco:2"]] },
  { slug: "nabteb", name: "NABTEB", image: "/images/providers/nabteb.png", products: [["result-checking-pin", "Result Checking PIN", "nabteb:1"], ["gce-registration-pin", "GCE Registration PIN", "nabteb:2"]] },
  { slug: "jamb", name: "JAMB", image: "/images/providers/jamb.png", products: [["utme-registration-pin", "UTME Registration PIN", "jamb:1"], ["direct-entry-registration-pin", "Direct Entry Registration PIN", "jamb:2"]] },
] as const

export const cableProviders = [
  { slug: "dstv", name: "DStv", image: "/images/providers/dstv.png" },
  { slug: "gotv", name: "GOtv", image: "/images/providers/gotv.png" },
  { slug: "startimes", name: "Startimes", image: "/images/providers/startimes.png" },
  { slug: "showmax", name: "Showmax", image: "/images/providers/showmax.png" },
] as const

export function ProviderGrid({ type, basePath }: { type: "education" | "cable"; basePath?: string }) {
  const prefix = basePath || `/services/${type}`

  if (type === "education") {
    return <div className="grid gap-4 sm:grid-cols-2">
      {educationProviders.map((provider) => (
        <Link key={provider.slug} href={`${prefix}/${provider.slug}`} className="group">
          <Card className="h-full overflow-hidden rounded-2xl transition hover:-translate-y-0.5 hover:border-emerald-500/40 hover:shadow-lg">
            <ServiceVisual src={provider.image} alt={`${provider.name} logo`} icon="education" className="h-36 rounded-none border-0 border-b" />
            <CardContent className="p-5">
              <div className="flex items-center justify-between gap-3"><div><h2 className="font-bold">{provider.name}</h2><p className="mt-1 text-sm text-muted-foreground">{provider.products.length} supported products</p></div><GraduationCap className="size-5 text-emerald-500" /></div>
              <span className="mt-4 inline-flex items-center text-sm font-bold text-emerald-500">View options <ArrowRight className="ml-1 size-4" /></span>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  }

  return <div className="grid gap-4 sm:grid-cols-2">
    {cableProviders.map((provider) => (
      <Link key={provider.slug} href={`${prefix}/${provider.slug}`} className="group">
        <Card className="h-full overflow-hidden rounded-2xl transition hover:-translate-y-0.5 hover:border-emerald-500/40 hover:shadow-lg">
          <ServiceVisual src={provider.image} alt={`${provider.name} logo`} icon="cable" className="h-36 rounded-none border-0 border-b" />
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-3"><div><h2 className="font-bold">{provider.name}</h2><p className="mt-1 text-sm text-muted-foreground">View available subscription plans</p></div><Tv className="size-5 text-emerald-500" /></div>
            <span className="mt-4 inline-flex items-center text-sm font-bold text-emerald-500">View plans <ArrowRight className="ml-1 size-4" /></span>
          </CardContent>
        </Card>
      </Link>
    ))}
  </div>
}
