import Link from "next/link";
import { ArrowRight, Lightbulb, Tv } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const services = [
  {
    href: "/dashboard/cable",
    title: "Cable TV",
    description:
      "Choose your TV provider, enter the Smart Card/IUC number and verify the customer before reviewing the purchase.",
    icon: Tv,
  },
  {
    href: "/dashboard/bills/electricity",
    title: "Electricity",
    description:
      "Select your Disco, enter the meter details and verify the customer before reviewing the purchase.",
    icon: Lightbulb,
  },
] as const;

export default function Page() {
  return (
    <div className="teksum-dashboard-page min-w-0 w-full flex flex-1 flex-col gap-8">
      <div className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-500">
          Bills & subscriptions
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">
          Choose a service
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Cable TV and electricity are handled separately so each service can
          collect the customer details it actually needs.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {services.map(({ href, title, description, icon: Icon }) => (
          <Link key={href} href={href} className="group">
            <Card className="h-full rounded-3xl transition hover:-translate-y-0.5 hover:border-emerald-500/40 hover:shadow-lg">
              <CardContent className="flex h-full flex-col p-7">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                  <Icon className="size-6" />
                </div>
                <h2 className="mt-6 text-2xl font-bold">{title}</h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  {description}
                </p>
                <span className="mt-auto flex items-center pt-8 text-sm font-bold text-emerald-500">
                  Open {title}
                  <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
