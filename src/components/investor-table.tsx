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
      <div className="flex flex-col gap-3 border-b border-[#2c2c54]/60 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="relative max-w-sm flex-1"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#707095]" /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} className="input-shell h-9 pl-9 pr-3 text-[11px]" placeholder="Search investors…" /></div><select className="input-shell h-9 w-auto px-3 text-[11px]" defaultValue="all"><option value="all">All projects</option><option>Active positions</option><option>Completed positions</option></select></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="bg-[#171734] text-[9px] uppercase tracking-wider text-[#747499]"><tr>{[["name", "Investor"], ["projects", "Positions"], ["invested", "Total invested"], ["distributed", "Distributed"]].map(([key, label]) => <th key={key} className={`px-5 py-3 font-medium ${key !== "name" ? "text-right" : ""}`}><button onClick={() => changeSort(key as keyof InvestorTableRow)} className="inline-flex items-center gap-1.5 uppercase tracking-wider">{label}<ArrowUpDown size={10} /></button></th>)}<th className="px-5 py-3 text-right font-medium">Details</th></tr></thead><tbody>{visible.map((row, index) => <tr key={row.id} className={`table-row border-t border-[#2c2c54]/40 text-[11px] ${index % 2 ? "bg-[#181837]/40" : ""}`}><td className="px-5 py-3.5"><div className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-lg bg-[linear-gradient(135deg,#302f68,#276c75)] text-[9px] font-semibold">{row.name.split(" ").map((word) => word[0]).join("")}</span><div><p className="font-medium">{row.name}</p><p className="mt-1 text-[9px] text-[#77779a]">{row.email}</p></div></div></td><td className="tabular px-5 py-3.5 text-right">{row.projects}</td><td className="tabular px-5 py-3.5 text-right font-medium">{compactMoney.format(row.invested)}</td><td className="tabular px-5 py-3.5 text-right text-[#4fe8b8]">{compactMoney.format(row.distributed)}</td><td className="px-5 py-3.5 text-right"><Link href={`/admin/investors/${row.id}`} className="rounded-lg bg-[#272751] px-2.5 py-1.5 text-[9px] font-semibold text-[#aaa0ff] hover:bg-[#6c5ce7] hover:text-white">Open</Link></td></tr>)}</tbody></table></div>
      <div className="flex items-center justify-between border-t border-[#2c2c54]/60 px-5 py-3"><p className="text-[9px] text-[#77779a]">Showing {visible.length} of {filtered.length} investors</p><div className="flex items-center gap-2"><button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="grid size-7 place-items-center rounded-lg bg-[#222249] text-[#8d8dad] disabled:opacity-30"><ChevronLeft size={13} /></button><span className="text-[9px] text-[#8585a7]">{Math.min(page, pages)} / {pages}</span><button disabled={page >= pages} onClick={() => setPage((value) => value + 1)} className="grid size-7 place-items-center rounded-lg bg-[#222249] text-[#8d8dad] disabled:opacity-30"><ChevronRight size={13} /></button></div></div>
    </section>
  );
}
