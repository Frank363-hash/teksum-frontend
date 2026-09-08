export function BrandMark({ className = "size-9" }: { className?: string }) {
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-xl bg-emerald-500 font-black tracking-[-0.08em] text-white ${className}`} aria-label="TEKSUM">
      TS
    </span>
  )
}
