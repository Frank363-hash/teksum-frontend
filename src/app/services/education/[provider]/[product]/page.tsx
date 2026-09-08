import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { PublicShell } from "@/components/public-shell"
import { ServiceForm } from "@/components/teksum/service-form"
import { ServiceVisual } from "@/components/teksum/service-visual"
import { educationProviders } from "@/components/teksum/service-discovery"

export function generateStaticParams() {
  return educationProviders.flatMap((provider) =>
    provider.products.map(([product]) => ({ provider: provider.slug, product }))
  )
}

export async function generateMetadata({ params }: { params: Promise<{ provider: string; product: string }> }): Promise<Metadata> {
  const { provider, product } = await params
  const item = educationProviders.find((x) => x.slug === provider)
  const productItem = item?.products.find(([slug]) => slug === product)
  if (!item || !productItem) return {}
  return {
    title: `${item.name} ${productItem[1]}`,
    description: `View the ${item.name} ${productItem[1]} purchase options available through TEKSUM.`,
    alternates: { canonical: `/services/education/${item.slug}/${productItem[0]}` },
  }
}

export default async function EducationProductPage({params}:{params:Promise<{provider:string;product:string}>}){
  const {provider,product}=await params
  const item=educationProviders.find(x=>x.slug===provider)
  const productItem=item?.products.find(([slug])=>slug===product)
  if(!item||!productItem) notFound()
  return <PublicShell><main className="min-w-0 mx-auto max-w-6xl px-5 py-10 lg:px-8"><div className="flex flex-wrap items-center gap-4 text-sm"><Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground"><ArrowLeft className="mr-2 size-4"/>Home</Link><Link href={`/services/education/${provider}`} className="inline-flex items-center text-muted-foreground hover:text-foreground">{item.name}</Link></div><div className="mt-7 grid gap-8 lg:grid-cols-[.75fr_1.25fr]"><section><ServiceVisual src={item.image} alt={`${item.name} logo`} icon="education" className="h-56"/><p className="mt-6 text-xs font-bold uppercase tracking-[.18em] text-emerald-500">{item.name}</p><h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{productItem[1]}</h1><p className="mt-4 text-muted-foreground">This page is for the selected product. You will see the current price, availability and quantity options before you confirm.</p></section><ServiceForm category="EDUCATION_PIN" title={`${item.name} ${productItem[1]}`} description="Confirm the details, then continue through secure checkout." publicMode initialNetwork={provider} fixedPlanId={productItem?.[2]} lockSelection /></div></main></PublicShell>
}
