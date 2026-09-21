import { ServiceForm } from "@/components/teksum/service-form"

export default function Page() {
  return (
    <div className="teksum-dashboard-page min-w-0 w-full flex flex-1">
      <ServiceForm
        category="AIRTIME"
        title="Airtime VTU"
        description="Recharge MTN, Airtel, Glo or 9mobile numbers from your TEKSUM wallet."
        dynamicAmount
      />
    </div>
  )
}
