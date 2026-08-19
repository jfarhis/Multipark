"use client";

import { Download, HandCoins, PencilLine, Plus, Trash2 } from "lucide-react";
import { useActionState } from "react";
import { createDistributionAction, deleteDistributionAction, initialFormState, updateDistributionAction } from "@/app/admin/actions";
import { money } from "@/lib/calculations";
import type { DashboardData, Distribution } from "@/lib/types";
import { FormMessage } from "./form-message";
import { SubmitButton } from "./submit-button";

function DistributionEditor({ distribution, data }: { distribution: Distribution; data: DashboardData }) {
  const [updateState, updateAction] = useActionState(updateDistributionAction.bind(null, distribution.id), initialFormState);
  const [deleteState, deleteAction] = useActionState(deleteDistributionAction.bind(null, distribution.id), initialFormState);
  const project = data.projects.find((item) => item.id === distribution.projectId);
  const investor = data.investors.find((item) => item.id === distribution.investorId);
  return (
    <details className="border-b border-[#202b25] last:border-0">
      <summary className="grid cursor-pointer list-none items-center gap-3 px-4 py-3 sm:grid-cols-[1.2fr_1fr_110px_110px_28px]">
        <div className="min-w-0"><p className="truncate text-[10px] font-medium">{investor?.name ?? distribution.investorId}</p><p className="mt-1 truncate text-[8px] text-[#657269]">{distribution.id}</p></div>
        <p className="truncate text-[9px] text-[#87938b]">{project?.name ?? distribution.projectId}</p>
        <p className="tabular text-[9px] text-[#738078]">{distribution.date}</p>
        <p className="tabular text-[10px] font-semibold text-[#35d99a] sm:text-right">{money.format(distribution.amount)}</p>
        <PencilLine size={13} className="text-[#7967d5]" />
      </summary>
      <div className="border-t border-[#1a241e] bg-[#0b110e] p-4">
        <form action={updateAction} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5 xl:items-end">
          <label className="field-label">Project<select name="projectId" defaultValue={distribution.projectId} className="input-shell mt-2 h-10 px-3">{data.projects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label className="field-label">Investor<select name="investorId" defaultValue={distribution.investorId} className="input-shell mt-2 h-10 px-3">{data.investors.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label className="field-label">Amount<input required type="number" min="0.01" step="0.01" name="amount" defaultValue={distribution.amount} className="input-shell mt-2 h-10 px-3" /></label>
          <label className="field-label">Date<input required type="date" name="date" defaultValue={distribution.date} className="input-shell mt-2 h-10 px-3" /></label>
          <label className="field-label">Replace receipt<input name="receipt" type="file" accept=".pdf,.png,.jpg,.jpeg" className="input-shell mt-2 h-10 p-2 text-[9px]" /></label>
          <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2 xl:col-span-5"><div className="flex items-center gap-2">{distribution.receiptFileUrl !== "#" ? <a href={distribution.receiptFileUrl} className="secondary-button px-3"><Download size={12} />Current receipt</a> : <span className="text-[9px] text-[#68766e]">No receipt uploaded</span>}<FormMessage state={updateState} /></div><SubmitButton pendingLabel="Updating…">Save distribution</SubmitButton></div>
        </form>
        <form action={deleteAction} className="mt-4 flex flex-col gap-3 border-t border-[#342126] pt-4 sm:flex-row sm:items-end"><label className="field-label max-w-xs flex-1">Type DELETE<input name="confirmation" className="input-shell mt-2 h-9 px-3" autoComplete="off" /></label><SubmitButton pendingLabel="Removing…" variant="danger"><Trash2 size={12} />Remove</SubmitButton><FormMessage state={deleteState} /></form>
      </div>
    </details>
  );
}

export function DistributionManager({ data }: { data: DashboardData }) {
  const [createState, createAction] = useActionState(createDistributionAction, initialFormState);
  const sorted = data.distributions.toSorted((a, b) => b.date.localeCompare(a.date));
  return (
    <>
      <section className="panel p-5">
        <div className="flex items-start gap-3"><span className="grid size-9 place-items-center rounded-xl bg-[#22c9a5]/10 text-[#4fdbbd]"><Plus size={15} /></span><div><p className="text-[12px] font-semibold">Record a distribution</p><p className="mt-1 text-[9px] text-[#718078]">Adds the payment to the investor dashboard and optionally stores its private receipt.</p></div></div>
        <form action={createAction} className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5 xl:items-end">
          <label className="field-label">Project<select name="projectId" className="input-shell mt-2 h-10 px-3">{data.projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
          <label className="field-label">Investor<select name="investorId" className="input-shell mt-2 h-10 px-3">{data.investors.map((investor) => <option key={investor.id} value={investor.id}>{investor.name}</option>)}</select></label>
          <label className="field-label">Amount<input required type="number" min="0.01" step="0.01" name="amount" className="input-shell mt-2 h-10 px-3" /></label>
          <label className="field-label">Date<input required type="date" name="date" className="input-shell mt-2 h-10 px-3" /></label>
          <label className="field-label">Receipt (optional)<input name="receipt" type="file" accept=".pdf,.png,.jpg,.jpeg" className="input-shell mt-2 h-10 p-2 text-[9px]" /></label>
          <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2 xl:col-span-5"><FormMessage state={createState} /><SubmitButton pendingLabel="Recording…"><HandCoins size={13} />Record distribution</SubmitButton></div>
        </form>
      </section>
      <section className="panel mt-4 overflow-hidden">
        <div className="border-b border-[#202b25] px-4 py-3"><p className="text-[11px] font-semibold">Distribution history</p><p className="mt-1 text-[8px] text-[#657269]">Select any row to edit, replace its receipt, or remove it.</p></div>
        <div>{sorted.map((distribution) => <DistributionEditor key={distribution.id} distribution={distribution} data={data} />)}</div>
        {sorted.length === 0 ? <div className="p-10 text-center text-[10px] text-[#718078]">No distributions have been recorded.</div> : null}
      </section>
    </>
  );
}
