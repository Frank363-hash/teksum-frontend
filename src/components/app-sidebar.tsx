"use client";

import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Smartphone,
  Radio,
  GraduationCap,
  Tv,
  WalletCards,
  ReceiptText,
  ShieldCheck,
  Settings,
  LogOut,
  KeyRound,
  Globe2,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { clearSession, getProfile } from "@/lib/teksum-api";
import { useEffect, useState } from "react";

const items = [
  ["Overview", "/dashboard", LayoutDashboard],
  ["Buy Data", "/dashboard/data", Radio],
  ["Airtime VTU", "/dashboard/airtime", Smartphone],
  ["Exam PINs", "/dashboard/exam-pins", GraduationCap],
  ["Cable TV & Power", "/dashboard/bills", Tv],
  ["Wallet & Funding", "/dashboard/wallet", WalletCards],
  ["Transactions", "/dashboard/transactions", ReceiptText],
  ["Airtime PIN", "/dashboard/airtime-pin", KeyRound],
  ["International Airtime", "/dashboard/international-airtime", Globe2],
] as const;

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const [user, setUser] = useState<{
    name: string;
    email: string;
    role: string;
  } | null>(null);
  useEffect(() => {
    getProfile({ redirectOn401: false })
      .then((u) =>
        setUser({
          name: u.fullName || "TEKSUM User",
          email: u.email,
          role: u.role,
        }),
      )
      .catch(() => {});
  }, []);
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
              <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500 text-white font-black">
                T
              </div>
              <div className="grid flex-1 text-left leading-tight">
                <span className="font-black tracking-tight">TEKSUM</span>
                <span className="text-xs text-muted-foreground">
                  VTU • Payments
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Services</SidebarGroupLabel>
          <SidebarMenu>
            {items.map(([title, url, Icon]) => (
              <SidebarMenuItem key={url}>
                <SidebarMenuButton
                  isActive={
                    pathname === url ||
                    (url !== "/dashboard" && pathname.startsWith(url))
                  }
                  tooltip={title}
                  render={<Link href={url} />}
                >
                  <Icon />
                  <span>{title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        {user?.role === "ADMIN" || user?.role === "SUPER_ADMIN" ? (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={pathname.startsWith("/admin")}
                  render={<Link href="/admin" />}
                >
                  <ShieldCheck />
                  <span>Admin Panel</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        ) : null}
        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton render={<Link href="/dashboard/settings" />}>
                <Settings />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              onClick={() => {
                clearSession().finally(() => {
                  window.location.href = "/sign-in";
                });
              }}
            >
              <Avatar className="size-8">
                <AvatarFallback>
                  {(user?.name || "T").slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate text-sm font-medium">
                  {user?.name || "TEKSUM User"}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {user?.email || "Sign in"}
                </span>
              </div>
              <LogOut className="size-4" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
