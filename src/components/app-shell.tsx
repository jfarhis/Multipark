"use client";

import { UserButton } from "@clerk/nextjs";
import { Building2, Camera, FileText, HandCoins, LayoutDashboard, Plus, Search, Settings, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { Session } from "@/lib/types";
import { Logo } from "./logo";

const adminNav = [
  ["Resumen", "/admin", LayoutDashboard],
  ["Proyectos", "/projects", Building2],
  ["Inversionistas", "/admin/investors", Users],
  ["Pagos", "/admin/distributions", HandCoins],
  ["Avances", "/admin/documents", Camera],
  ["Configuración", "/settings", Settings],
] as const;

const investorNav = [
  ["Resumen", "/dashboard", LayoutDashboard],
  ["Proyectos", "/projects", Building2],
  ["Avances y documentos", "/dashboard/documents", FileText],
  ["Configuración", "/settings", Settings],
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/admin" || href === "/dashboard") return pathname === href;
  return pathname.startsWith(href);
}

function breadcrumbLabel(pathname: string) {
  if (pathname.includes("investors")) return "Inversionistas";
  if (pathname.includes("documents")) return "Avances y documentos";
  if (pathname.includes("distributions")) return "Pagos a inversionistas";
  if (pathname.includes("settings")) return "Configuración";
  if (pathname.includes("projects")) return "Proyectos";
  return "Resumen del portafolio";
}

export function AppShell({ session, children }: { session: Session; children: ReactNode }) {
  const pathname = usePathname();
  const nav = session.role === "admin" ? adminNav : investorNav;

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[244px] border-r border-[#1b2340] bg-[#0b101e] md:flex md:flex-col">
        <div className="flex h-[66px] items-center border-b border-[#1b2340] px-5"><Logo /></div>
        <div className="px-3 pt-5">
          <p className="px-3 text-[12px] font-semibold uppercase tracking-[.16em] text-[#58627f]">Secciones del portal</p>
          <nav className="mt-2 space-y-1">
            {nav.map(([label, href, Icon]) => {
              const active = isActive(pathname, href);
              return (
                <Link key={label} href={href} prefetch aria-current={active ? "page" : undefined} className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-[14px] font-medium transition ${active ? "bg-[#1b2547] text-white shadow-[0_0_18px_rgba(77,124,254,.15)]" : "text-[#8a93b2] hover:bg-[#121830] hover:text-white"}`}>
                  <Icon size={15} strokeWidth={1.8} className={active ? "text-[#7ea2ff]" : "text-[#4a5470]"} />
                  <span>{label}</span>
                  {active ? <span className="ml-auto size-1.5 rounded-full bg-[#4d7cfe]" /> : null}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="mx-3 mb-3 mt-auto">
          <div className="rounded-xl border border-[#1b2340] bg-[#0f1527] p-3">
            <div className="flex items-center gap-2.5">
              <UserButton />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-[#e6eaf6]">{session.name}</p>
                <p className="truncate text-[12px] text-[#6b7594]">{session.email}</p>
              </div>
            </div>
            <p className="mt-3 border-t border-[#1b2340] pt-2 text-[11px] uppercase tracking-[.12em] text-[#58627f]">{session.role === "admin" ? "Administrador" : "Acceso de inversionista"}</p>
          </div>
        </div>
      </aside>

      <div className="md:pl-[244px]">
        <header className="sticky top-0 z-30 flex h-[66px] items-center gap-4 border-b border-[#1b2340] bg-[#0b101e]/92 px-4 backdrop-blur-xl sm:px-6">
          <div className="min-w-0">
            <p className="text-[12px] text-[#596382]">Gasfar Capital / Panel</p>
            <p className="truncate text-[15px] font-medium text-[#e6eaf6]">{breadcrumbLabel(pathname)}</p>
          </div>
          <form action="/projects" method="get" className="relative ml-auto hidden w-full max-w-[320px] sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#596382]" size={13} />
            <input name="q" aria-label="Buscar proyectos" className="input-shell h-9 pl-9 pr-3 text-[13px]" placeholder="Buscar proyectos…" />
          </form>
          {session.role === "admin" ? (
            <details className="group relative ml-auto sm:ml-0">
              <summary className="primary-button list-none px-3"><Plus size={15} />Agregar</summary>
              <div className="absolute right-0 top-12 z-50 w-72 rounded-xl border border-[#2a3554] bg-[#10162a] p-2 shadow-2xl">
                <p className="px-3 py-2 text-[15px] font-semibold uppercase tracking-wider text-[#596382]">¿Qué deseas agregar?</p>
                <Link href="/admin#new-project" className="flex items-center gap-3 rounded-lg px-3 py-3 text-[13px] hover:bg-[#1b2547]"><Building2 size={16} className="text-[#8fb0ff]" /><span><strong className="block">Proyecto</strong><small className="mt-0.5 block text-[#7c86a6]">Nave industrial y ubicación</small></span></Link>
                <Link href="/admin/investors#invite-investor" className="flex items-center gap-3 rounded-lg px-3 py-3 text-[13px] hover:bg-[#1b2547]"><Users size={16} className="text-[#8fb0ff]" /><span><strong className="block">Inversionista</strong><small className="mt-0.5 block text-[#7c86a6]">Invitación e inversión en MXN</small></span></Link>
                <Link href="/admin/documents#upload-update" className="flex items-center gap-3 rounded-lg px-3 py-3 text-[13px] hover:bg-[#1b2547]"><Camera size={16} className="text-[#8fb0ff]" /><span><strong className="block">Avance o documento</strong><small className="mt-0.5 block text-[#7c86a6]">Fotos, reportes y archivos</small></span></Link>
                <Link href="/admin/distributions#new-payment" className="flex items-center gap-3 rounded-lg px-3 py-3 text-[13px] hover:bg-[#1b2547]"><HandCoins size={16} className="text-[#8fb0ff]" /><span><strong className="block">Pago</strong><small className="mt-0.5 block text-[#7c86a6]">Distribución y comprobante</small></span></Link>
              </div>
            </details>
          ) : null}
          <div className="flex items-center rounded-lg border border-[#1b2340] bg-[#10162a] p-1.5 pr-2.5">
            <UserButton />
            <div className="ml-2 hidden sm:block">
              <p className="max-w-28 truncate text-[12px] font-semibold">{session.name}</p>
              <p className="text-[11px] text-[#596382]">{session.role === "admin" ? "Administrador" : "Inversionista"}</p>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1540px] p-4 sm:p-5 lg:p-6">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-50 flex h-[66px] items-center justify-around border-t border-[#1b2340] bg-[#0b101e]/96 px-2 backdrop-blur-xl md:hidden">
        {nav.map(([label, href, Icon]) => {
          const active = isActive(pathname, href);
          return <Link key={label} href={href} className={`flex min-w-14 flex-col items-center gap-1 rounded-lg py-2 text-[11px] ${active ? "text-[#7ea2ff]" : "text-[#596382]"}`}><Icon size={16} /><span>{label}</span></Link>;
        })}
      </nav>
    </div>
  );
}
