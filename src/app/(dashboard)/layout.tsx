"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { CommandPalette } from "@/components/command-palette";
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getProfile, isAuthenticationError, isRateLimitedError } from "@/lib/teksum-api";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [temporaryError, setTemporaryError] = useState("");

  useEffect(() => {
    let active = true;
    getProfile({ redirectOn401: false })
      .then(() => {
        if (!active) return;
        setTemporaryError("");
        setReady(true);
      })
      .catch((error) => {
        if (!active) return;

        if (isRateLimitedError(error)) {
          setTemporaryError("Too many requests. Please wait a moment and try again.");
          return;
        }

        if (isAuthenticationError(error)) {
          const next = `${pathname}${window.location.search}`;
          router.replace(`/sign-in?redirect=${encodeURIComponent(next)}`);
          return;
        }

        setTemporaryError("We couldn't confirm your session right now. Please try again.");
      });

    return () => {
      active = false;
    };
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="min-h-svh bg-background p-6">
        <div className="mx-auto mt-24 max-w-sm rounded-2xl border bg-card p-6 text-center text-sm text-muted-foreground">
          {temporaryError ? (
            <>
              <p>{temporaryError}</p>
              <button
                type="button"
                className="mt-4 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
                onClick={() => window.location.reload()}
              >
                Try again
              </button>
            </>
          ) : (
            "Checking your TEKSUM session…"
          )}
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <header className="flex h-14 shrink-0 items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="flex min-w-0 flex-1 items-center gap-2 px-3 sm:px-4">
            <SidebarTrigger className="shrink-0" />
            <Separator orientation="vertical" className="h-4 shrink-0" />
            <div className="min-w-0 flex-1 overflow-hidden">
              <DynamicBreadcrumb />
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 pr-3 sm:pr-4">
            <kbd className="pointer-events-none hidden h-6 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
            <ThemeToggle />
          </div>
        </header>
        <CommandPalette />
        <main className="flex min-w-0 flex-1 flex-col teksum-page-enter teksum-motion-surface overflow-x-hidden">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
