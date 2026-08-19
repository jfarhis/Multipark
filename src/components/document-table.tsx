"use client";

import { ChevronLeft, ChevronRight, Download, FileImage, FileText, PencilLine, ReceiptText, Search, Trash2 } from "lucide-react";
import { useActionState, useMemo, useState } from "react";
import { deleteDocumentAction, initialFormState, updateDocumentAction } from "@/app/admin/actions";
import type { DashboardData, DocumentType } from "@/lib/types";
import { FormMessage } from "./form-message";
import { SubmitButton } from "./submit-button";

export type DocumentRow = { id: string; title: string; projectId: string; project: string; investorId: string | null; investor: string; type: DocumentType; date: string; url: string };
const icons = { receipt: ReceiptText, report: FileText, photo: FileImage };

function DocumentEditor({ row, data }: { row: DocumentRow; data: DashboardData }) {
  const [updateState, updateAction] = useActionState(updateDocumentAction.bind(null, row.id), initialFormState);
  const [deleteState, deleteAction] = useActionState(deleteDocumentAction.bind(null, row.id), initialFormState);
  const Icon = icons[row.type];
  return (
    <details className="border-b border-[#202b25] last:border-0">
      <summary className="grid cursor-pointer list-none items-center gap-3 px-4 py-3 sm:grid-cols-[minmax(0,1.5fr)_1fr_1fr_90px_28px]">
        <div className="flex min-w-0 items-center gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#211d3b] text-[#aa99ff]"><Icon size={14} /></span><div className="min-w-0"><p className="truncate text-[10px] font-medium">{row.title}</p><p className="mt-1 text-[8px] capitalize text-[#657269]">{row.type}</p></div></div>
        <p className="truncate text-[9px] text-[#87938b]">{row.project}</p><p className="truncate text-[9px] text-[#748078]">{row.investor}</p><p className="tabular text-[8px] text-[#657269]">{row.date}</p><PencilLine size={13} className="text-[#7967d5]" />
      </summary>
      <div className="border-t border-[#1a241e] bg-[#0b110e] p-4">
        <form action={updateAction} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5 xl:items-end">
          <label className="field-label">Title<input required name="title" defaultValue={row.title} className="input-shell mt-2 h-10 px-3" /></label>
          <label className="field-label">Project<select required name="projectId" defaultValue={row.projectId} className="input-shell mt-2 h-10 px-3">{data.projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
          <label className="field-label">Visible to<select name="investorId" defaultValue={row.investorId ?? ""} className="input-shell mt-2 h-10 px-3"><option value="">All project investors</option>{data.investors.map((investor) => <option key={investor.id} value={investor.id}>{investor.name}</option>)}</select></label>
          <label className="field-label">Type<select name="type" defaultValue={row.type} className="input-shell mt-2 h-10 px-3"><option value="report">Report</option><option value="receipt">Receipt</option><option value="photo">Photo</option></select></label>
          <label className="field-label">Replace file<input name="file" type="file" accept=".pdf,.png,.jpg,.jpeg,.xlsx" className="input-shell mt-2 h-10 p-2 text-[9px]" /></label>
          <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2 xl:col-span-5"><div className="flex items-center gap-2">{row.url !== "#" ? <a href={row.url} className="secondary-button px-3"><Download size={12} />Open current file</a> : <span className="text-[9px] text-[#68766e]">Upload a replacement to activate this file.</span>}<FormMessage state={updateState} /></div><SubmitButton pendingLabel="Updating…">Save document</SubmitButton></div>
        </form>
        <form action={deleteAction} className="mt-4 flex flex-col gap-3 border-t border-[#342126] pt-4 sm:flex-row sm:items-end"><label className="field-label max-w-xs flex-1">Type DELETE<input name="confirmation" className="input-shell mt-2 h-9 px-3" autoComplete="off" /></label><SubmitButton pendingLabel="Removing…" variant="danger"><Trash2 size={12} />Remove</SubmitButton><FormMessage state={deleteState} /></form>
      </div>
    </details>
  );
}

function DocumentViewer({ row }: { row: DocumentRow }) {
  const Icon = icons[row.type];
  const content = <><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#211d3b] text-[#aa99ff]"><Icon size={14} /></span><span className="min-w-0"><span className="block truncate text-[10px] font-medium">{row.title}</span><span className="mt-1 block truncate text-[8px] text-[#718078]">{row.project} · {row.type} · {row.date}</span></span>{row.url !== "#" ? <span className="grid size-8 place-items-center rounded-lg bg-[#17211b] text-[#77867d]"><Download size={13} /></span> : <span className="rounded-md bg-[#2a2115] px-2 py-1 text-[8px] text-[#d6aa57]">Pending</span>}</>;
  return row.url !== "#"
    ? <a href={row.url} className="table-row grid grid-cols-[36px_minmax(0,1fr)_36px] items-center gap-3 border-b border-[#202b25] px-4 py-3.5 last:border-0">{content}</a>
    : <div className="grid grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-3 border-b border-[#202b25] px-4 py-3.5 last:border-0">{content}</div>;
}

export function DocumentTable({ rows, data, editable = false }: { rows: DocumentRow[]; data?: DashboardData; editable?: boolean }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 7;
  const filtered = useMemo(() => rows.filter((row) => (type === "all" || row.type === type) && `${row.title} ${row.project} ${row.investor}`.toLowerCase().includes(query.toLowerCase())).toSorted((a, b) => b.date.localeCompare(a.date)), [rows, query, type]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  return (
    <section className="panel overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-[#202b25] p-4 lg:flex-row lg:items-center"><div className="relative max-w-sm flex-1"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#68766e]" /><input aria-label="Search documents" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} className="input-shell h-9 pl-9 pr-3 text-[11px]" placeholder="Search documents…" /></div><select aria-label="Filter by file type" value={type} onChange={(event) => { setType(event.target.value); setPage(1); }} className="input-shell h-9 w-auto px-3 text-[11px]"><option value="all">All file types</option><option value="receipt">Receipts</option><option value="report">Reports</option><option value="photo">Photos</option></select></div>
      <div>{visible.map((row) => editable && data ? <DocumentEditor key={row.id} row={row} data={data} /> : <DocumentViewer key={row.id} row={row} />)}</div>
      {visible.length === 0 ? <div className="p-12 text-center text-[11px] text-[#718078]">No documents match these filters.</div> : null}
      <div className="flex items-center justify-between border-t border-[#202b25] px-5 py-3"><p className="text-[9px] text-[#657269]">Showing {visible.length} of {filtered.length} documents</p><div className="flex items-center gap-2"><button aria-label="Previous page" disabled={currentPage <= 1} onClick={() => setPage((value) => value - 1)} className="grid size-7 place-items-center rounded-lg bg-[#17211b] disabled:opacity-30"><ChevronLeft size={13} /></button><span className="text-[9px] text-[#78857d]">{currentPage} / {pages}</span><button aria-label="Next page" disabled={currentPage >= pages} onClick={() => setPage((value) => value + 1)} className="grid size-7 place-items-center rounded-lg bg-[#17211b] disabled:opacity-30"><ChevronRight size={13} /></button></div></div>
    </section>
  );
}
