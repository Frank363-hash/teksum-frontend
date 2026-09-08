import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { PublicShell } from "@/components/public-shell"
import { ServiceVisual } from "@/components/teksum/service-visual"
import { educationProviders } from "@/components/teksum/service-discovery"

export function generateStaticParams() {
  return educationProviders.map(({ slug }) => ({ provider: slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ provider: string }> }): Promise<Metadata> {
  const { provider } = await params
  const item = educationProviders.find((x) => x.slug === provider)
  if (!item) return {}
  return {
    title: `${item.name} Education Products`,
    description: `Explore available ${item.name} examination products through TEKSUM.`,
    alternates: { canonical: `/services/education/${item.slug}` },
  }
}

export default async function EducationProviderPage({params}:{params:Promise<{provider:string}>}){
  const {provider}=await params
  const item=educationProviders.find(x=>x.slug===provider)
  if(!item) notFound()
  return <PublicShell><main className="min-w-0 mx-auto max-w-6xl px-5 py-10 lg:px-8"><div className="flex flex-wrap items-center gap-4 text-sm"><Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground"><ArrowLeft className="mr-2 size-4"/>Home</Link><Link href="/services/education" className="inline-flex items-center text-muted-foreground hover:text-foreground">All education</Link></div><div className="mt-7 grid gap-8 lg:grid-cols-[.8fr_1.2fr]"><section><ServiceVisual src={item.image} alt={`${item.name} logo`} icon="education" className="h-64"/><p className="mt-6 text-xs font-bold uppercase tracking-[.18em] text-emerald-500">Education service</p><h1 className="mt-2 text-4xl font-black tracking-tight">{item.name}</h1><p className="mt-4 text-muted-foreground">Choose the exact product you need. Each product has its own purchase page and available quantity options.</p></section><section className="grid gap-3">{item.products.map(([slug,title])=><Link key={slug} href={`/services/education/${item.slug}/${slug}`} className="group rounded-2xl border bg-card p-5 transition hover:border-emerald-500/40"><div className="flex items-center justify-between gap-4"><div><p className="font-bold">{title}</p><p className="mt-1 text-sm text-muted-foreground">Open this product's purchase flow.</p></div><ArrowRight className="size-5 text-emerald-500 transition group-hover:translate-x-1"/></div></Link>)}</section></div></main></PublicShell>
}
