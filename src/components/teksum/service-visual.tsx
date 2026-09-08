"use client"

import { useState } from "react"
import Image from "next/image"
import { Globe2, GraduationCap, KeyRound, Radio, Smartphone, Tv, Zap } from "lucide-react"

const icons = { data: Radio, airtime: Smartphone, education: GraduationCap, "exam-pins": GraduationCap, cable: Tv, power: Zap, "airtime-pin": KeyRound, "international-airtime": Globe2 } as const

export function ServiceVisual({ src, alt, icon, className = "" }: { src: string; alt: string; icon: keyof typeof icons | string; className?: string }) {
  const [failed, setFailed] = useState(false)
  const Icon = icons[icon as keyof typeof icons] ?? Radio
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-emerald-500/10 bg-emerald-500/[.06] ${className}`}>
      {!failed && <Image src={src} alt={alt} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" onError={() => setFailed(true)} />}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent ${failed ? "hidden" : ""}`} />
      <div className={`grid h-full place-items-center ${failed ? "" : "opacity-0"}`}>
        <div className="grid size-14 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-500"><Icon className="size-7" /></div>
      </div>
    </div>
  )
}
