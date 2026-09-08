import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ServiceForm } from "@/components/teksum/service-form"

export default function Page() {
  return (
    <div className="teksum-dashboard-page min-w-0 w-full flex flex-1 flex-col gap-6">
      <Link
        href="/dashboard/bills"
        className="inline-flex w-fit items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 size-4" />
        Bills & subscriptions
      </Link>

      <ServiceForm
        category="ELECTRICITY"
        title="Electricity"
        description="Select your Disco, enter your meter details and verify the customer before reviewing the purchase."
      />
    </div>
  )
}
