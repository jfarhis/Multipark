"use client";

import { UserButton } from "@clerk/nextjs";
import { Building2, FileText, LayoutDashboard, Search, Settings, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { Session } from "@/lib/types";
import { Logo } from "./logo";

const adminNav = [
  ["Overview", "/admin", LayoutDashboard],
  ["Projects", "/projects", Building2],
  ["Investors", "/admin/investors", Users],
  ["Documents", "/admin/documents", FileText],
  ["Settings", "/settings", Settings],
] as const;

const investorNav = [
  ["Dashboard", "/dashboard", LayoutDashboard],
  ["Projects", "/projects", Building2],
  ["Documents", "/dashboard/documents", FileText],
  ["Settings", "/settings", Settings],
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/admin" || href === "/dashboard") return pathname === href;
  return pathname.startsWith(href);
}

function breadcrumbLabel(pathname: string) {
  if (pathname.includes("investors")) return "Investors";
  if (pathname.includes("documents")) return "Documents";
  if (pathname.includes("settings")) return "Settings";
  if (pathname.includes("projects")) return "Projects";
  return "Portfolio overview";
}

export function AppShell({ session, children }: { session: Session; children: ReactNode }) {
  const pathname = usePathname();
  const nav = session.role === "admin" ? adminNav : investorNav;

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[216px] border-r border-[#202b25] bg-[#090d0b] md:flex md:flex-col">
        <div className="flex h-[66px] items-center border-b border-[#202b25] px-5"><Logo /></div>
        <div className="px-3 pt-5">
          <p className="px-3 text-[9px] font-semibold uppercase tracking-[.16em] text-[#5e6c64]">Workspace</p>
          <nav className="mt-2 space-y-1">
            {nav.map(([label, href, Icon]) => {
              const active = isActive(pathname, href);
              return (
                <Link key={label} href={href} className={`flex h-10 items-center gap-3 rounded-lg px-3 text-[11px] font-medium transition ${active ? "bg-[#17221d] text-white" : "text-[#829088] hover:bg-[#111814] hover:text-white"}`}>
                  <Icon size={15} strokeWidth={1.8} className={active ? "text-[#a694ff]" : "text-[#647169]"} />
                  {label}
                  {active ? <span className="ml-auto size-1.5 rounded-full bg-[#8b72ff]" /> : null}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="mx-3 mt-auto mb-3 rounded-xl border border-[#202b25] bg-[#0e1511] p-3">
          <div className="flex items-center gap-2.5">
            <UserButton />
            <div className="min-w-0">
              <p className="truncate text-[10px] font-semibold text-[#e9efeb]">{session.name}</p>
              <p className="truncate text-[9px] text-[#68766e]">{session.email}</p>
            </div>
          </div>
          <p className="mt-3 border-t border-[#202b25] pt-2 text-[8px] uppercase tracking-[.12em] text-[#58645d]">{session.role === "admin" ? "Administrator" : "Investor access"}</p>
        </div>
      </aside>

      <div className="md:pl-[216px]">
        <header className="sticky top-0 z-30 flex h-[66px] items-center gap-4 border-b border-[#202b25] bg-[#090d0b]/92 px-4 backdrop-blur-xl sm:px-6">
          <div className="min-w-0">
            <p className="text-[9px] text-[#617068]">Gasfar Capital / Dashboard</p>
            <p className="truncate text-[12px] font-medium text-[#eaf0ec]">{breadcrumbLabel(pathname)}</p>
          </div>
          <form action="/projects" method="get" className="relative ml-auto hidden w-full max-w-[320px] sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#68766e]" size={13} />
            <input name="q" aria-label="Search projects" className="input-shell h-9 pl-9 pr-3 text-[10px]" placeholder="Search projects…" />
          </form>
          <div className="flex items-center rounded-lg border border-[#202b25] bg-[#0f1612] p-1.5 pr-2.5">
            <UserButton />
            <div className="ml-2 hidden sm:block">
              <p className="max-w-28 truncate text-[9px] font-semibold">{session.name}</p>
              <p className="text-[8px] capitalize text-[#66746c]">{session.role}</p>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1540px] p-4 sm:p-5 lg:p-6">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-50 flex h-[66px] items-center justify-around border-t border-[#202b25] bg-[#090d0b]/96 px-2 backdrop-blur-xl md:hidden">
        {nav.map(([label, href, Icon]) => {
          const active = isActive(pathname, href);
          return <Link key={label} href={href} className={`flex min-w-14 flex-col items-center gap-1 rounded-lg py-2 text-[8px] ${active ? "text-[#a694ff]" : "text-[#66746c]"}`}><Icon size={16} /><span>{label}</span></Link>;
        })}
      </nav>
    </div>
  );
}
