"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPublicServices, PublicService } from "@/lib/teksum-api";

const groups = [
  ["DATA", "MTN / Airtel / Glo / 9mobile"],
  ["AIRTIME", "MTN / Airtel / Glo / 9mobile"],
  ["EDUCATION", "WAEC / NECO / NABTEB / JAMB"],
  ["CABLE", "DStv / GOtv / Startimes"],
  ["ELECTRICITY", "Supported electricity providers"],
] as const;

export function PublicPreview() {
  const [services, setServices] = useState<PublicService[]>([]);
  const [selected, setSelected] = useState("DATA");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicServices()
      .then((r) => setServices(r.services))
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, []);

  const match =
    selected === "EDUCATION"
      ? services.find((s) => s.code === "EDUCATION")
      : services.find((s) => s.code === selected);
  const active = match?.available ?? false;

  return (
    <Card className="rounded-3xl border-border bg-card/85 p-5 text-card-foreground shadow-2xl backdrop-blur-xl sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-500">
            Service preview
          </p>
          <h3 className="mt-1 text-lg font-bold">
            Explore what TEKSUM supports
          </h3>
        </div>
        {loading && (
          <Loader2 className="size-4 animate-spin text-emerald-500" />
        )}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2">
        {groups.map(([code, label]) => (
          <button
            key={code}
            type="button"
            onClick={() => setSelected(code)}
            className={`rounded-xl border px-3 py-3 text-left text-xs font-semibold transition ${selected === code ? "border-emerald-500 bg-emerald-500/10 text-foreground" : "border-border bg-background/50 text-muted-foreground hover:text-foreground"}`}
          >
            <span className="block">
              {code.replace("EDUCATION", "EXAM PINS")}
            </span>
            <span className="mt-1 block text-[10px] font-normal opacity-70">
              {label}
            </span>
          </button>
        ))}
      </div>
      <div className="mt-4 rounded-2xl border border-border/60 bg-background/50 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold">
              {groups.find(([code]) => code === selected)?.[1]}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {active
                ? "Available on TEKSUM"
                : "Availability could not be confirmed"}
            </p>
          </div>
          <CheckCircle2
            className={`size-5 ${active ? "text-emerald-500" : "text-muted-foreground/40"}`}
          />
        </div>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          Purchase prices are confirmed after you sign in. We do not display made-up prices.
        </p>
      </div>
      <Button
        className="mt-5 w-full rounded-xl bg-emerald-500 text-black hover:bg-emerald-400"
        render={
          <Link
            href="/services"
          />
        }
      >
        View all services <ArrowRight />
      </Button>
    </Card>
  );
}
