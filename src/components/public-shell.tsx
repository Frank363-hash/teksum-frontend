import Link from "next/link";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobilePublicNav } from "@/components/mobile-public-nav";

const serviceLinks = [
  ["Airtime", "/services/airtime"],
  ["Data", "/services/data"],
  ["Cable TV", "/services/cable"],
  ["Electricity", "/services/power"],
  ["Education", "/services/education"],
  ["Airtime PIN", "/services/airtime-pin"],
] as const;

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh min-w-0 overflow-x-clip bg-background text-foreground teksum-page-enter teksum-motion-surface">
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex min-w-0 max-w-7xl items-center justify-between px-4 py-4 sm:px-5 lg:px-8">
          <Brand />
          <nav className="hidden gap-6 text-sm text-muted-foreground md:flex">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <Link href="/services" className="hover:text-foreground">
              Services
            </Link>
            <Link href="/pricing" className="hover:text-foreground">
              Pricing
            </Link>
            <Link href="/faq" className="hover:text-foreground">
              FAQ
            </Link>
            <Link href="/contact" className="hover:text-foreground">
              Contact
            </Link>
          </nav>
          <div className="flex min-w-0 shrink-0 items-center gap-1 sm:gap-2">
            <MobilePublicNav />
            <ThemeToggle />
            <Button variant="ghost" render={<Link href="/sign-in" />}>
              Sign in
            </Button>
            <Button
              className="rounded-xl bg-emerald-500 text-black hover:bg-emerald-400"
              render={<Link href="/sign-up" />}
            >
              Register
            </Button>
          </div>
        </div>
      </header>
      {children}
      <footer className="border-t bg-card teksum-footer">
        <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Brand />
              <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">
                Digital services made easier. Data, airtime, bills and education
                products in one place.
              </p>
            </div>
            <div>
              <p className="text-sm font-bold">Services</p>
              <div className="mt-3 grid gap-1.5 text-sm text-muted-foreground">
                {serviceLinks.map(([label, href]) => (
                  <Link
                    key={href}
                    href={href}
                    className="hover:text-foreground"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-bold">Company</p>
              <div className="mt-3 grid gap-1.5 text-sm text-muted-foreground">
                <Link href="/about" className="hover:text-foreground">
                  About
                </Link>
                <Link href="/faq" className="hover:text-foreground">
                  FAQ
                </Link>
                <Link href="/contact" className="hover:text-foreground">
                  Contact
                </Link>
              </div>
            </div>
            <div>
              <p className="text-sm font-bold">Legal</p>
              <div className="mt-3 grid gap-1.5 text-sm text-muted-foreground">
                <Link href="/terms" className="hover:text-foreground">
                  Terms & Conditions
                </Link>
                <Link href="/privacy" className="hover:text-foreground">
                  Privacy Policy
                </Link>
                <Link href="/wallet-terms" className="hover:text-foreground">
                  Wallet & Funding Terms
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-7 flex flex-col gap-2 border-t pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>© 2026 TEKSUM</span>
            <span>
              Need help?{" "}
              <Link href="/contact" className="font-semibold text-foreground">
                Contact support
              </Link>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
