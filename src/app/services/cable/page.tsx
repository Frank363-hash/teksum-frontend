import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { PublicShell } from "@/components/public-shell"
import { ProviderGrid } from "@/components/teksum/service-discovery"
export default function CableServicesPage(){return <PublicShell><main className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16"><Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="mr-2 size-4"/>Home</Link><p className="mt-7 text-xs font-bold uppercase tracking-[.18em] text-emerald-500">Cable TV</p><h1 className="mt-2 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">Choose your TV provider.</h1><p className="mt-4 max-w-2xl text-muted-foreground">Pick DStv, GOtv, Startimes or Showmax to load that provider's live plans.</p><div className="mt-10"><ProviderGrid type="cable"/></div></main></PublicShell>}
