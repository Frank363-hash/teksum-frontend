"use client"
import { useEffect, useState } from "react"
import { AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { apiFetch, formatNaira } from "@/lib/teksum-api"

type VendorBalance = { provider: string; status: string; balanceNGN?: string; error?: string }

export default function Page(){
  const [items,setItems]=useState<VendorBalance[]>([])
  const [error,setError]=useState("")
  const [loading,setLoading]=useState(true)
  async function load(){setLoading(true);setError("");try{const d=await apiFetch<{vendorBalances?:VendorBalance[]}>("/api/v1/admin/dashboard");setItems(d.vendorBalances||[])}catch(e){setError(e instanceof Error?e.message:"Unable to load provider balances")}finally{setLoading(false)}}
  useEffect(()=>{load().catch(()=>{})},[])
  return <div className="teksum-admin-page min-w-0 w-full">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-black">Vendor Balances</h1><p className="mt-1 text-sm text-muted-foreground">Provider operations only. These balances are separate from customer wallet holdings.</p></div><Button variant="outline" onClick={()=>load()} disabled={loading}><RefreshCw className={`mr-2 size-4 ${loading?"animate-spin":""}`}/>Refresh</Button></div>
    {error&&<p className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
    <div className="mt-6 grid gap-4 md:grid-cols-2">{items.map(v=>{const isError=v.status.toUpperCase()==="ERROR";const isLow=v.status.toUpperCase()==="LOW";return <Card key={v.provider} className="rounded-2xl"><CardHeader><CardTitle className="flex flex-wrap items-center justify-between gap-3 text-base">{v.provider}<Badge variant="secondary" className={isError?"text-destructive":isLow?"text-amber-600":"text-emerald-600"}>{v.status}</Badge></CardTitle></CardHeader><CardContent><p className="text-3xl font-black">{isError?"ERROR":formatNaira(v.balanceNGN)}</p><p className="mt-2 text-sm text-muted-foreground">{isError?<><AlertTriangle className="mr-1 inline size-4 text-destructive"/>Provider balance API returned an error. {v.error||""}</>:isLow?<><AlertTriangle className="mr-1 inline size-4 text-amber-500"/>Low balance threshold reached.</>:<><CheckCircle2 className="mr-1 inline size-4 text-emerald-500"/>Balance is above the configured threshold.</>}</p></CardContent></Card>})}{!items.length&&!loading&&<Card className="rounded-2xl"><CardContent className="p-6 text-sm text-muted-foreground">No provider balance data returned.</CardContent></Card>}</div>
  </div>
}
