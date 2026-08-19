"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Bell, Building2, ChevronDown, FileText, LayoutDashboard, LogOut, Search, Settings, Users } from "lucide-react";
import type { Session } from "@/lib/types";
import { logout } from "@/app/login/actions";
import { Logo } from "./logo";

export function AppShell({ session, children }: { session: Session; children: ReactNode }) {
  const pathname = usePathname();
  const nav = session.role === "admin"
    ? [["Overview", "/admin", LayoutDashboard], ["Projects", "/projects/aurora-residences", Building2], ["Investors", "/admin/investors", Users], ["Documents", "/admin/documents", FileText], ["Settings", "/settings", Settings]] as const
    : [["Dashboard", "/dashboard", LayoutDashboard], ["Projects", "/projects/aurora-residences", Building2], ["Documents", "/dashboard/documents", FileText], ["Settings", "/settings", Settings]] as const;
  const initials = session.name.split(" ").map((word) => word[0]).slice(0, 2).join("");
  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[88px] border-r border-[#2c2c54]/60 bg-[#151532]/95 md:flex md:flex-col md:items-center">
        <div className="mt-5"><Logo compact /></div>
        <nav className="mt-11 flex flex-1 flex-col gap-2">
          {nav.map(([label, href, Icon]) => {
            const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
            return <Link key={label} href={href} aria-label={label} title={label} className={`group relative grid size-11 place-items-center rounded-xl transition ${active ? "bg-[#6c5ce7] text-white shadow-[0_9px_24px_rgba(108,92,231,.27)]" : "text-[#7f7fa3] hover:bg-[#20204a] hover:text-white"}`}><Icon size={18} strokeWidth={1.8} /><span className="pointer-events-none absolute left-[54px] hidden rounded-md bg-[#282853] px-2 py-1 text-[10px] text-white group-hover:block">{label}</span></Link>;
          })}
        </nav>
        <form action={logout} className="mb-5"><button aria-label="Sign out" className="grid size-11 place-items-center rounded-xl text-[#74749a] transition hover:bg-[#20204a] hover:text-white"><LogOut size={17} /></button></form>
      </aside>
      <div className="md:pl-[88px]">
        <header className="sticky top-0 z-30 flex h-[72px] items-center gap-3 border-b border-[#2c2c54]/50 bg-[#12122b]/88 px-4 backdrop-blur-xl sm:px-6">
          <div className="relative hidden max-w-[420px] flex-1 sm:block"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#77779c]" size={15} /><input className="input-shell h-10 pl-10 pr-3 text-[12px]" placeholder="Search projects, investors, documents…" /></div>
          <div className="ml-auto flex items-center gap-2.5">
            <button aria-label="Notifications" className="relative grid size-9 place-items-center rounded-xl border border-[#2c2c54] bg-[#1a1a3a] text-[#9a9ab8]"><Bell size={15} /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-[#e84f6f] ring-2 ring-[#1a1a3a]" /></button>
            <div className="flex items-center gap-2.5 rounded-xl border border-[#2c2c54] bg-[#1a1a3a] py-1.5 pl-1.5 pr-2.5"><span className="grid size-8 place-items-center rounded-lg bg-[linear-gradient(135deg,#6c5ce7,#00cec9)] text-[10px] font-bold">{initials}</span><div className="hidden sm:block"><p className="text-[11px] font-semibold leading-4">{session.name}</p><p className="text-[9px] capitalize text-[#8888a9]">{session.role}</p></div><ChevronDown size={13} className="hidden text-[#77779a] sm:block" /></div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1480px] p-4 sm:p-6">{children}</main>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-50 flex h-[68px] items-center justify-around border-t border-[#2c2c54] bg-[#151532]/95 px-2 backdrop-blur-xl md:hidden">
        {nav.slice(0, 5).map(([label, href, Icon]) => { const active = href === "/admin" ? pathname === href : pathname.startsWith(href); return <Link key={label} href={href} className={`flex min-w-14 flex-col items-center gap-1 rounded-xl py-2 text-[9px] ${active ? "text-[#9f92ff]" : "text-[#737398]"}`}><Icon size={17} /><span>{label}</span></Link>; })}
      </nav>
    </div>
  );
}
