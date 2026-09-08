import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { PublicShell } from "@/components/public-shell"
import { ServiceForm } from "@/components/teksum/service-form"
import { ServiceVisual } from "@/components/teksum/service-visual"
import { cableProviders } from "@/components/teksum/service-discovery"

export function generateStaticParams() {
  return cableProviders.map(({ slug }) => ({ provider: slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ provider: string }> }): Promise<Metadata> {
  const { provider } = await params
  const item = cableProviders.find((x) => x.slug === provider)
  if (!item) return {}
  return {
    title: `${item.name} Cable TV`,
    description: `View available ${item.name} subscription options through TEKSUM.`,
    alternates: { canonical: `/services/cable/${item.slug}` },
  }
}

export default async function CableProviderPage({params}:{params:Promise<{provider:string}>}){
  const {provider}=await params
  const item=cableProviders.find(x=>x.slug===provider)
  if(!item) notFound()
  return <PublicShell><main className="min-w-0 mx-auto max-w-6xl px-5 py-10 lg:px-8"><div className="flex flex-wrap items-center gap-4 text-sm"><Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground"><ArrowLeft className="mr-2 size-4"/>Home</Link><Link href="/services/cable" className="inline-flex items-center text-muted-foreground hover:text-foreground">All cable providers</Link></div><div className="mt-7 grid gap-8 lg:grid-cols-[.75fr_1.25fr]"><section><ServiceVisual src={item.image} alt={`${item.name} logo`} icon="cable" className="h-56"/><p className="mt-6 text-xs font-bold uppercase tracking-[.18em] text-emerald-500">Cable TV</p><h1 className="mt-2 text-4xl font-black tracking-tight">{item.name}</h1><p className="mt-4 text-muted-foreground">Select an available {item.name} plan after signing in. You will see the current price before you confirm.</p></section><ServiceForm category="CABLE" title={`${item.name} subscription`} description="Enter the smart card details and choose an available plan." publicMode initialNetwork={provider} lockSelection /></div></main></PublicShell>
}
