import { BrandMark } from "@/components/brand-mark"
import { ServiceForm } from "@/components/teksum/service-form"

export default function Page() {
  return (
    <div className="teksum-dashboard-page min-w-0 w-full flex flex-1 flex-col gap-4">
      <div className="flex items-center gap-3">
        <BrandMark className="size-10" />
        <div>
          <p className="font-black tracking-tight">TEKSUM</p>
          <p className="text-xs text-muted-foreground">Airtime VTU</p>
        </div>
      </div>
      <ServiceForm
        category="AIRTIME"
        title="Airtime VTU"
        description="Recharge MTN, Airtel, Glo or 9mobile numbers from your TEKSUM wallet."
        dynamicAmount
      />
    </div>
  )
}
