import Link from "next/link"
import { BrandMark } from "@/components/brand-mark"

export function Brand({ href = "/", dark = false }: { href?: string; dark?: boolean }) {
  return (
    <Link href={href} className={`flex items-center gap-2.5 ${dark ? "text-white" : "text-foreground"}`}>
      <BrandMark />
      <span className="font-black tracking-tight">TEKSUM</span>
    </Link>
  )
}
