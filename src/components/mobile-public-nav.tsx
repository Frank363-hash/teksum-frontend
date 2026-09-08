"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const links = [
  ["Home", "/"],
  ["Services", "/services"],
  ["Pricing", "/pricing"],
  ["FAQ", "/faq"],
  ["Contact", "/contact"],
] as const;

export function MobilePublicNav() {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            className="size-9 rounded-xl md:hidden"
            aria-label="Open navigation menu"
          />
        }
      >
        <Menu className="size-4" />
      </SheetTrigger>
      <SheetContent side="right" className="w-[min(86vw,22rem)] p-0 sm:max-w-sm">
        <SheetHeader className="border-b pr-12">
          <SheetTitle>
            <Brand />
          </SheetTitle>
          <SheetDescription>Navigate TEKSUM</SheetDescription>
        </SheetHeader>
        <nav aria-label="Mobile navigation" className="grid gap-1 p-4">
          {links.map(([label, href]) => (
            <SheetClose
              key={href}
              nativeButton={false}
              render={
                <Link
                  href={href}
                  className="rounded-xl px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
                />
              }
            >
              {label}
            </SheetClose>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
