"use client";

import { Download, HandCoins, PencilLine, Plus, Trash2 } from "lucide-react";
import { useActionState, useState } from "react";
import { createDistributionAction, deleteDistributionAction, updateDistributionAction } from "@/app/admin/actions";
import { initialFormState } from "@/lib/form-state";
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
    <details className="border-b border-[#232b45] last:border-0">
      <summary className="grid cursor-pointer list-none items-center gap-3 px-4 py-3 sm:grid-cols-[1.2fr_1fr_110px_110px_28px]">
        <div className="min-w-0"><p className="truncate text-[13px] font-medium">{investor?.name ?? distribution.investorId}</p><p className="mt-1 truncate text-[11px] text-[#596382]">{distribution.id}</p></div>
        <p className="truncate text-[12px] text-[#8a93b2]">{project?.name ?? distribution.projectId}</p>
        <p className="tabular text-[12px] text-[#7c86a6]">{distribution.date}</p>
        <p className="tabular text-[13px] font-semibold text-[#2dd4a7] sm:text-right">{money.format(distribution.amount)}</p>
        <PencilLine size={13} className="text-[#6d8dfa]" />
      </summary>
      <div className="border-t border-[#182038] bg-[#0e1425] p-4">
        <form action={updateAction} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5 xl:items-end">
          <label className="field-label">Proyecto<select name="projectId" defaultValue={distribution.projectId} className="input-shell mt-2 h-10 px-3">{data.projects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label className="field-label">Inversionista<select name="investorId" defaultValue={distribution.investorId} className="input-shell mt-2 h-10 px-3">{data.investors.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label className="field-label">Monto pagado (MXN)<input required type="number" min="0.01" step="0.01" name="amount" defaultValue={distribution.amount} className="input-shell mt-2 h-10 px-3" /></label>
          <label className="field-label">Fecha<input required type="date" name="date" defaultValue={distribution.date} className="input-shell mt-2 h-10 px-3" /></label>
          <label className="field-label">Reemplazar comprobante<input name="receipt" type="file" accept=".pdf,.png,.jpg,.jpeg" className="input-shell mt-2 h-10 p-2 text-[12px]" /></label>
          <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2 xl:col-span-5"><div className="flex items-center gap-2">{distribution.receiptFileUrl !== "#" ? <a href={distribution.receiptFileUrl} className="secondary-button px-3"><Download size={12} />Comprobante actual</a> : <span className="text-[12px] text-[#6b7594]">Sin comprobante</span>}<FormMessage state={updateState} /></div><SubmitButton pendingLabel="Actualizando…">Guardar pago</SubmitButton></div>
        </form>
        <form action={deleteAction} className="mt-4 flex flex-col gap-3 border-t border-[#342126] pt-4 sm:flex-row sm:items-end"><label className="field-label max-w-xs flex-1">Escribe ELIMINAR<input name="confirmation" className="input-shell mt-2 h-9 px-3" autoComplete="off" /></label><SubmitButton pendingLabel="Eliminando…" variant="danger"><Trash2 size={12} />Eliminar</SubmitButton><FormMessage state={deleteState} /></form>
      </div>
    </details>
  );
}

export function DistributionManager({ data }: { data: DashboardData }) {
  const [createState, createAction] = useActionState(createDistributionAction, initialFormState);
  const [projectId, setProjectId] = useState(data.projects[0]?.id ?? "");
  const today = new Date().toISOString().slice(0, 10);
  const sorted = data.distributions.toSorted((a, b) => b.date.localeCompare(a.date));
  const eligibleInvestors = data.investors.filter((investor) => data.stakes.some((stake) => stake.projectId === projectId && stake.investorId === investor.id));
  const canCreate = data.projects.length > 0 && data.investors.length > 0 && data.stakes.length > 0;
  return (
    <>
      <section id="new-payment" className="panel scroll-mt-24 p-5">
        <div className="flex items-start gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#4d7cfe]/10 text-[#2dd4a7]"><Plus size={17} /></span><div><p className="text-[16px] font-semibold">Registrar un pago</p><p className="mt-1 text-[13px] leading-5 text-[#6b7594]">El monto se registra en pesos mexicanos (MXN), aparece en el panel del inversionista y puede incluir un comprobante privado.</p></div></div>
        {canCreate ? <form action={createAction} className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5 xl:items-end">
          <label className="field-label">Proyecto<select name="projectId" value={projectId} onChange={(event) => setProjectId(event.target.value)} className="input-shell mt-2 h-10 px-3">{data.projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
          <label className="field-label">Inversionista<select required name="investorId" className="input-shell mt-2 h-10 px-3"><option value="">Selecciona un inversionista</option>{eligibleInvestors.map((investor) => <option key={investor.id} value={investor.id}>{investor.name}</option>)}</select><span className="mt-2 block font-normal text-[#6b7594]">Solo aparecen quienes tienen inversión en este proyecto.</span></label>
          <label className="field-label">Monto pagado (MXN)<input required type="number" min="0.01" step="0.01" name="amount" className="input-shell mt-2 h-10 px-3" placeholder="Ej. 150000" /></label>
          <label className="field-label">Fecha<input required type="date" name="date" defaultValue={today} className="input-shell mt-2 h-10 px-3" /></label>
          <label className="field-label">Comprobante (opcional)<input name="receipt" type="file" accept=".pdf,.png,.jpg,.jpeg" className="input-shell mt-2 h-10 p-2 text-[12px]" /></label>
          <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2 xl:col-span-5"><FormMessage state={createState} /><SubmitButton pendingLabel="Registrando pago…"><HandCoins size={13} />Registrar pago</SubmitButton></div>
        </form> : <div className="mt-5 rounded-xl border border-[#2a3554] bg-[#121830] p-4 text-[13px] leading-5 text-[#7c86a6]">Primero crea un proyecto, agrega un inversionista y registra cuánto invirtió en MXN.</div>}
      </section>
      <section className="panel mt-4 overflow-hidden">
        <div className="border-b border-[#232b45] px-4 py-3"><p className="text-[15px] font-semibold">Historial de pagos</p><p className="mt-1 text-[13px] text-[#596382]">Selecciona una fila para editar el pago, reemplazar el comprobante o eliminarlo.</p></div>
        <div>{sorted.map((distribution) => <DistributionEditor key={distribution.id} distribution={distribution} data={data} />)}</div>
        {sorted.length === 0 ? <div className="p-10 text-center text-[13px] text-[#6b7594]">Todavía no hay distribuciones registradas.</div> : null}
      </section>
    </>
  );
}
