"use client";

import Link from "next/link";
import { ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { compactMoney } from "@/lib/calculations";

export type InvestorTableRow = { id: string; name: string; email: string; projects: number; invested: number; distributed: number };

export function InvestorTable({ rows }: { rows: InvestorTableRow[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<keyof InvestorTableRow>("invested");
  const [descending, setDescending] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const filtered = useMemo(() => rows.filter((row) => `${row.name} ${row.email}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => { const left = a[sort]; const right = b[sort]; const comparison = typeof left === "string" ? left.localeCompare(String(right)) : Number(left) - Number(right); return descending ? -comparison : comparison; }), [rows, query, sort, descending]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((Math.min(page, pages) - 1) * pageSize, Math.min(page, pages) * pageSize);
  const changeSort = (key: keyof InvestorTableRow) => { if (key === sort) setDescending((value) => !value); else { setSort(key); setDescending(key !== "name"); } };
  return (
    <section className="panel overflow-hidden">
      <div className="border-b border-[#202b25] p-4"><div className="relative max-w-sm"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#68766e]" /><input aria-label="Buscar inversionistas" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} className="input-shell h-9 pl-9 pr-3 text-[11px]" placeholder="Buscar inversionistas…" /></div></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="bg-[#141c18] text-[9px] uppercase tracking-wider text-[#5f6c64]"><tr>{[["name", "Inversionista"], ["projects", "Participaciones"], ["invested", "Total invertido"], ["distributed", "Distribuido"]].map(([key, label]) => <th key={key} className={`px-5 py-3 font-medium ${key !== "name" ? "text-right" : ""}`}><button onClick={() => changeSort(key as keyof InvestorTableRow)} className="inline-flex items-center gap-1.5 uppercase tracking-wider">{label}<ArrowUpDown size={10} /></button></th>)}<th className="px-5 py-3 text-right font-medium">Detalles</th></tr></thead><tbody>{visible.map((row, index) => <tr key={row.id} className={`table-row border-t border-[#202b25]/70 text-[11px] ${index % 2 ? "bg-[#101713]/60" : ""}`}><td className="px-5 py-3.5"><div className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-lg bg-[linear-gradient(135deg,#302f68,#276c75)] text-[9px] font-semibold">{row.name.split(" ").map((word) => word[0]).join("")}</span><div><p className="font-medium">{row.name}</p><p className="mt-1 text-[9px] text-[#718078]">{row.email}</p></div></div></td><td className="tabular px-5 py-3.5 text-right">{row.projects}</td><td className="tabular px-5 py-3.5 text-right font-medium">{compactMoney.format(row.invested)}</td><td className="tabular px-5 py-3.5 text-right text-[#4fe8b8]">{compactMoney.format(row.distributed)}</td><td className="px-5 py-3.5 text-right"><Link href={`/admin/investors/${row.id}`} className="rounded-lg bg-[#211d3b] px-2.5 py-1.5 text-[9px] font-semibold text-[#aa99ff] hover:bg-[#8b72ff] hover:text-white">Abrir</Link></td></tr>)}{visible.length === 0 ? <tr><td colSpan={5} className="px-5 py-12 text-center text-[10px] text-[#718078]">Todavía no hay inversionistas.</td></tr> : null}</tbody></table></div>
      <div className="flex items-center justify-between border-t border-[#202b25] px-5 py-3"><p className="text-[9px] text-[#718078]">Mostrando {visible.length} de {filtered.length} inversionistas</p><div className="flex items-center gap-2"><button aria-label="Página anterior" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="grid size-7 place-items-center rounded-lg bg-[#17211b] text-[#77867d] disabled:opacity-30"><ChevronLeft size={13} /></button><span className="text-[9px] text-[#84908a]">{Math.min(page, pages)} / {pages}</span><button aria-label="Página siguiente" disabled={page >= pages} onClick={() => setPage((value) => value + 1)} className="grid size-7 place-items-center rounded-lg bg-[#17211b] text-[#77867d] disabled:opacity-30"><ChevronRight size={13} /></button></div></div>
    </section>
  );
}
