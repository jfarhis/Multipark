"use client";

import { UserButton } from "@clerk/nextjs";
import { Building2, FileText, HandCoins, LayoutDashboard, PanelLeftClose, PanelLeftOpen, Search, Settings, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore, type ReactNode } from "react";
import type { Session } from "@/lib/types";
import { Logo } from "./logo";

const navListeners = new Set<() => void>();
const subscribeNav = (listener: () => void) => { navListeners.add(listener); return () => { navListeners.delete(listener); }; };
const readCollapsed = () => localStorage.getItem("gasfar-nav-expanded") !== "1";
const writeCollapsed = (collapsed: boolean) => {
  localStorage.setItem("gasfar-nav-expanded", collapsed ? "0" : "1");
  navListeners.forEach((listener) => listener());
};

const adminNav = [
  ["Resumen", "/admin", LayoutDashboard],
  ["Proyectos", "/projects", Building2],
  ["Inversionistas", "/admin/investors", Users],
  ["Distribuciones", "/admin/distributions", HandCoins],
  ["Documentos", "/admin/documents", FileText],
  ["Configuración", "/settings", Settings],
] as const;

const investorNav = [
  ["Resumen", "/dashboard", LayoutDashboard],
  ["Proyectos", "/projects", Building2],
  ["Documentos", "/dashboard/documents", FileText],
  ["Configuración", "/settings", Settings],
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/admin" || href === "/dashboard") return pathname === href;
  return pathname.startsWith(href);
}

function breadcrumbLabel(pathname: string) {
  if (pathname.includes("investors")) return "Inversionistas";
  if (pathname.includes("documents")) return "Documentos";
  if (pathname.includes("distributions")) return "Distribuciones";
  if (pathname.includes("settings")) return "Configuración";
  if (pathname.includes("projects")) return "Proyectos";
  return "Resumen del portafolio";
}

export function AppShell({ session, children }: { session: Session; children: ReactNode }) {
  const pathname = usePathname();
  const nav = session.role === "admin" ? adminNav : investorNav;
  const collapsed = useSyncExternalStore(subscribeNav, readCollapsed, () => true);

  function toggle() {
    writeCollapsed(!collapsed);
  }

  return (
    <div className="min-h-screen">
      <aside className={`fixed inset-y-0 left-0 z-40 hidden border-r border-[#1b2340] bg-[#0b101e] transition-[width] duration-200 md:flex md:flex-col ${collapsed ? "w-[68px]" : "w-[216px]"}`}>
        <div className={`flex h-[66px] items-center border-b border-[#1b2340] ${collapsed ? "justify-center" : "px-5"}`}><Logo compact={collapsed} /></div>
        <div className={collapsed ? "px-3 pt-4" : "px-3 pt-5"}>
          {!collapsed && <p className="px-3 text-[9px] font-semibold uppercase tracking-[.16em] text-[#3e4762]">Espacio de trabajo</p>}
          <nav className="mt-2 space-y-1">
            {nav.map(([label, href, Icon]) => {
              const active = isActive(pathname, href);
              return (
                <Link key={label} href={href} title={label} className={`flex h-10 items-center rounded-lg text-[11px] font-medium transition ${collapsed ? "justify-center" : "gap-3 px-3"} ${active ? "bg-[#1b2547] text-white shadow-[0_0_18px_rgba(77,124,254,.15)]" : "text-[#6b7594] hover:bg-[#121830] hover:text-white"}`}>
                  <Icon size={15} strokeWidth={1.8} className={active ? "text-[#7ea2ff]" : "text-[#4a5470]"} />
                  {!collapsed && label}
                  {!collapsed && active ? <span className="ml-auto size-1.5 rounded-full bg-[#4d7cfe]" /> : null}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className={`mt-auto mb-3 ${collapsed ? "px-3" : "mx-3"}`}>
          <button onClick={toggle} title={collapsed ? "Expandir menú" : "Colapsar menú"} aria-label={collapsed ? "Expandir menú" : "Colapsar menú"} className={`mb-2 flex h-9 w-full items-center rounded-lg text-[10px] font-medium text-[#6b7594] transition hover:bg-[#121830] hover:text-white ${collapsed ? "justify-center" : "gap-3 px-3"}`}>
            {collapsed ? <PanelLeftOpen size={15} /> : <><PanelLeftClose size={15} />Colapsar</>}
          </button>
          <div className={`rounded-xl border border-[#1b2340] bg-[#0f1527] ${collapsed ? "grid place-items-center p-2" : "p-3"}`}>
            <div className={`flex items-center ${collapsed ? "" : "gap-2.5"}`}>
              <UserButton />
              {!collapsed && (
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-semibold text-[#e6eaf6]">{session.name}</p>
                  <p className="truncate text-[9px] text-[#596382]">{session.email}</p>
                </div>
              )}
            </div>
            {!collapsed && <p className="mt-3 border-t border-[#1b2340] pt-2 text-[8px] uppercase tracking-[.12em] text-[#3e4762]">{session.role === "admin" ? "Administrador" : "Acceso de inversionista"}</p>}
          </div>
        </div>
      </aside>

      <div className={`transition-[padding] duration-200 ${collapsed ? "md:pl-[68px]" : "md:pl-[216px]"}`}>
        <header className="sticky top-0 z-30 flex h-[66px] items-center gap-4 border-b border-[#1b2340] bg-[#0b101e]/92 px-4 backdrop-blur-xl sm:px-6">
          <div className="min-w-0">
            <p className="text-[9px] text-[#596382]">Gasfar Capital / Panel</p>
            <p className="truncate text-[12px] font-medium text-[#e6eaf6]">{breadcrumbLabel(pathname)}</p>
          </div>
          <form action="/projects" method="get" className="relative ml-auto hidden w-full max-w-[320px] sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#596382]" size={13} />
            <input name="q" aria-label="Buscar proyectos" className="input-shell h-9 pl-9 pr-3 text-[10px]" placeholder="Buscar proyectos…" />
          </form>
          <div className="flex items-center rounded-lg border border-[#1b2340] bg-[#10162a] p-1.5 pr-2.5">
            <UserButton />
            <div className="ml-2 hidden sm:block">
              <p className="max-w-28 truncate text-[9px] font-semibold">{session.name}</p>
              <p className="text-[8px] text-[#596382]">{session.role === "admin" ? "Administrador" : "Inversionista"}</p>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1540px] p-4 sm:p-5 lg:p-6">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-50 flex h-[66px] items-center justify-around border-t border-[#1b2340] bg-[#0b101e]/96 px-2 backdrop-blur-xl md:hidden">
        {nav.map(([label, href, Icon]) => {
          const active = isActive(pathname, href);
          return <Link key={label} href={href} className={`flex min-w-14 flex-col items-center gap-1 rounded-lg py-2 text-[8px] ${active ? "text-[#7ea2ff]" : "text-[#596382]"}`}><Icon size={16} /><span>{label}</span></Link>;
        })}
      </nav>
    </div>
  );
}
