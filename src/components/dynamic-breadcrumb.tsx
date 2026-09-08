"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const labelMap: Record<string, string> = {
  dashboard: "Dashboard",
  data: "Buy Data",
  airtime: "Airtime VTU",
  "exam-pins": "Exam PINs",
  bills: "Cable TV & Power",
  wallet: "Wallet & Funding",
  transactions: "Transactions",
  settings: "Settings",
  "sign-in": "Sign In",
  "sign-up": "Sign Up",
}

export function DynamicBreadcrumb() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  if (segments.length === 0) return null

  return (
    <Breadcrumb className="min-w-0 max-w-full overflow-hidden">
      <BreadcrumbList className="min-w-0 flex-nowrap overflow-hidden">
        {segments.map((segment, index) => {
          const href = "/" + segments.slice(0, index + 1).join("/")
          const label = labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
          const isLast = index === segments.length - 1

          return (
            <BreadcrumbItem
              key={href}
              className={[
                "min-w-0 shrink-0",
                index === 0 && segments.length > 1 ? "hidden md:inline-flex" : "",
                !isLast && index < segments.length - 2 ? "hidden md:inline-flex" : "",
              ].filter(Boolean).join(" ")}
            >
              {isLast ? (
                <BreadcrumbPage className="max-w-[46vw] truncate sm:max-w-none">{label}</BreadcrumbPage>
              ) : (
                <>
                  <BreadcrumbLink
                    className="max-w-[38vw] truncate sm:max-w-none"
                    render={<Link href={href} />}
                  >
                    {label}
                  </BreadcrumbLink>
                  <BreadcrumbSeparator className="hidden md:block" />
                </>
              )}
            </BreadcrumbItem>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
