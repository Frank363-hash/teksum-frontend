"use client"

import { ThemeProvider } from "next-themes"
import { TooltipProvider } from "@/components/ui/tooltip"
import { WhatsAppFloat } from "@/components/teksum/whatsapp-float"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>{children}<WhatsAppFloat /></TooltipProvider>
    </ThemeProvider>
  )
}