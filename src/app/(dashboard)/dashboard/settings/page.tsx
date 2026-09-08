import { Suspense } from "react"
import { SettingsPageClient } from "@/components/settings/settings-page-client"
export default function Page(){return <div className="teksum-dashboard-page min-w-0 w-full flex flex-1 flex-col gap-6"><Suspense fallback={<div className="rounded-2xl border bg-card p-8 text-sm text-muted-foreground">Loading settings…</div>}><SettingsPageClient/></Suspense></div>}
