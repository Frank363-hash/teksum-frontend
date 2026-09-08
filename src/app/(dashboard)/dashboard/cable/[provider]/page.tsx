import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { ServiceForm } from "@/components/teksum/service-form"
import { cableProviders } from "@/components/teksum/service-discovery"
export default async function Page({params}:{params:Promise<{provider:string}>}){const {provider}=await params;const item=cableProviders.find(x=>x.slug===provider);if(!item)notFound();return <div className="teksum-dashboard-page min-w-0 w-full flex flex-1 flex-col gap-6"><Link href="/dashboard/cable" className="inline-flex w-fit items-center text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="mr-2 size-4"/>All cable providers</Link><ServiceForm category="CABLE" title={`${item.name} subscription`} description="Choose from the available plans. The current price will be shown before you confirm." initialNetwork={provider}/></div>}
