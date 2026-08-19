"use client";

import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Download,
  HandCoins,
  MapPin,
  PencilLine,
  Plus,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { useActionState } from "react";
import { createDistributionAction, deleteDistributionAction, updateDistributionAction } from "@/app/admin/actions";
import { initialFormState } from "@/lib/form-state";
import { money } from "@/lib/calculations";
import type { DashboardData, Distribution, Investor, Project } from "@/lib/types";
import { FormMessage } from "./form-message";
import { SubmitButton } from "./submit-button";

function DistributionEditor({
  distribution,
  project,
  eligibleInvestors,
}: {
  distribution: Distribution;
  project: Project;
  eligibleInvestors: Investor[];
}) {
  const [updateState, updateAction] = useActionState(updateDistributionAction.bind(null, distribution.id), initialFormState);
  const [deleteState, deleteAction] = useActionState(deleteDistributionAction.bind(null, distribution.id), initialFormState);
  const investor = eligibleInvestors.find((item) => item.id === distribution.investorId);

  return (
    <details className="border-t border-[#232b45] first:border-t-0">
      <summary className="grid cursor-pointer list-none items-center gap-3 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_120px_150px_28px]">
        <div className="min-w-0">
          <p className="truncate text-[14px] font-medium">{investor?.name ?? distribution.investorId}</p>
          <p className="mt-1 truncate text-[12px] text-[#596382]">Pago {distribution.id}</p>
        </div>
        <p className="tabular text-[13px] text-[#8a93b2]">{distribution.date}</p>
        <p className="tabular text-[14px] font-semibold text-[#2dd4a7] sm:text-right">{money.format(distribution.amount)}</p>
        <PencilLine size={14} className="text-[#6d8dfa]" aria-hidden="true" />
      </summary>
      <div className="border-t border-[#182038] bg-[#0e1425] p-4">
        <form action={updateAction} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:items-end">
          <input type="hidden" name="projectId" value={project.id} />
          <label className="field-label">
            Inversionista de {project.name}
            <select name="investorId" defaultValue={distribution.investorId} className="input-shell mt-2 h-10 px-3">
              {eligibleInvestors.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <label className="field-label">
            Monto pagado (MXN)
            <input required type="number" min="0.01" step="0.01" name="amount" defaultValue={distribution.amount} className="input-shell mt-2 h-10 px-3" />
          </label>
          <label className="field-label">
            Fecha
            <input required type="date" name="date" defaultValue={distribution.date} className="input-shell mt-2 h-10 px-3" />
          </label>
          <label className="field-label">
            Reemplazar comprobante
            <input name="receipt" type="file" accept=".pdf,.png,.jpg,.jpeg" className="input-shell mt-2 h-10 p-2 text-[12px]" />
          </label>
          <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2 xl:col-span-4">
            <div className="flex flex-wrap items-center gap-2">
              {distribution.receiptFileUrl !== "#" ? <a href={distribution.receiptFileUrl} className="secondary-button px-3"><Download size={12} />Comprobante actual</a> : <span className="text-[12px] text-[#6b7594]">Sin comprobante</span>}
              <FormMessage state={updateState} />
            </div>
            <SubmitButton pendingLabel="Actualizando…">Guardar cambios</SubmitButton>
          </div>
        </form>
        <form action={deleteAction} className="mt-4 flex flex-col gap-3 border-t border-[#342126] pt-4 sm:flex-row sm:items-end">
          <label className="field-label max-w-xs flex-1">
            Escribe ELIMINAR
            <input name="confirmation" className="input-shell mt-2 h-9 px-3" autoComplete="off" />
          </label>
          <SubmitButton pendingLabel="Eliminando…" variant="danger"><Trash2 size={12} />Eliminar pago</SubmitButton>
          <FormMessage state={deleteState} />
        </form>
      </div>
    </details>
  );
}

function ProjectPayments({ data, project }: { data: DashboardData; project: Project }) {
  const [createState, createAction] = useActionState(createDistributionAction, initialFormState);
  const projectStakes = data.stakes.filter((stake) => stake.projectId === project.id);
  const eligibleInvestors = data.investors.filter((investor) => projectStakes.some((stake) => stake.investorId === investor.id));
  const payments = data.distributions.filter((distribution) => distribution.projectId === project.id).toSorted((a, b) => b.date.localeCompare(a.date));
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <section id={`project-${project.id}`} className="panel scroll-mt-24 overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-[#232b45] p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#4d7cfe]/10 text-[#8fb0ff]"><Building2 size={19} /></span>
          <div className="min-w-0">
            <h2 className="truncate text-[17px] font-semibold">{project.name}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-[13px] text-[#7c86a6]"><MapPin size={12} />{project.location}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[13px]">
          <span className="rounded-lg bg-[#121830] px-3 py-2 text-[#8a93b2]"><Users size={13} className="mr-1.5 inline" />{eligibleInvestors.length} {eligibleInvestors.length === 1 ? "inversionista" : "inversionistas"}</span>
          <span className="rounded-lg bg-[#10241f] px-3 py-2 font-semibold text-[#2dd4a7]">Pagado: {money.format(totalPaid)}</span>
          <Link href={`/projects/${project.id}`} className="secondary-button px-3">Abrir proyecto<ArrowRight size={13} /></Link>
        </div>
      </div>

      <div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <div className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#2dd4a7]/10 text-[#2dd4a7]"><Plus size={16} /></span>
            <div><h3 className="text-[15px] font-semibold">Agregar pago a este proyecto</h3><p className="mt-1 text-[13px] leading-5 text-[#7c86a6]">El inversionista lo verá dentro de {project.name}. Todos los montos se guardan en pesos mexicanos.</p></div>
          </div>

          {eligibleInvestors.length > 0 ? (
            <form action={createAction} className="mt-5 grid gap-3 sm:grid-cols-2">
              <input type="hidden" name="projectId" value={project.id} />
              <label className="field-label">
                Inversionista
                <select required name="investorId" defaultValue="" className="input-shell mt-2 h-10 px-3">
                  <option value="" disabled>Selecciona un inversionista</option>
                  {eligibleInvestors.map((investor) => <option key={investor.id} value={investor.id}>{investor.name}</option>)}
                </select>
                <span className="mt-2 block font-normal text-[#6b7594]">Solo aparecen inversionistas asignados a este proyecto.</span>
              </label>
              <label className="field-label">
                Monto pagado (MXN)
                <input required type="number" min="0.01" step="0.01" name="amount" className="input-shell mt-2 h-10 px-3" placeholder="Ej. 150000" />
              </label>
              <label className="field-label">
                Fecha del pago
                <input required type="date" name="date" defaultValue={today} className="input-shell mt-2 h-10 px-3" />
              </label>
              <label className="field-label">
                Comprobante (opcional, máximo 10 MB)
                <input name="receipt" type="file" accept=".pdf,.png,.jpg,.jpeg" className="input-shell mt-2 h-10 p-2 text-[12px]" />
              </label>
              <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2">
                <FormMessage state={createState} />
                <SubmitButton pendingLabel="Registrando pago…"><HandCoins size={14} />Registrar pago en MXN</SubmitButton>
              </div>
            </form>
          ) : (
            <div className="mt-5 rounded-xl border border-[#2a3554] bg-[#121830] p-4">
              <p className="text-[14px] font-semibold">Falta asignar un inversionista a este proyecto</p>
              <p className="mt-1 text-[13px] leading-5 text-[#7c86a6]">Primero agrega al inversionista y registra cuánto invirtió en {project.name}. Después podrás capturar sus pagos aquí.</p>
              <Link href="/admin/investors#invite-investor" className="primary-button mt-4 px-4"><UserPlus size={14} />Agregar o asignar inversionista</Link>
            </div>
          )}
        </div>

        <aside className="rounded-xl border border-[#232b45] bg-[#0c1120] p-4">
          <p className="text-[13px] font-semibold">Resumen de {project.name}</p>
          <dl className="mt-4 space-y-3">
            <div className="flex items-center justify-between gap-3 text-[13px]"><dt className="text-[#7c86a6]">Pagos registrados</dt><dd className="font-semibold">{payments.length}</dd></div>
            <div className="flex items-center justify-between gap-3 text-[13px]"><dt className="text-[#7c86a6]">Inversionistas</dt><dd className="font-semibold">{eligibleInvestors.length}</dd></div>
            <div className="flex items-center justify-between gap-3 border-t border-[#232b45] pt-3 text-[13px]"><dt className="text-[#7c86a6]">Total pagado</dt><dd className="font-semibold text-[#2dd4a7]">{money.format(totalPaid)}</dd></div>
          </dl>
        </aside>
      </div>

      <div className="border-t border-[#232b45]">
        <div className="px-5 py-4"><h3 className="text-[14px] font-semibold">Historial de pagos del proyecto</h3><p className="mt-1 text-[12px] text-[#6b7594]">Abre cualquier pago para editarlo, reemplazar el comprobante o eliminarlo.</p></div>
        {payments.length > 0 ? <div>{payments.map((distribution) => <DistributionEditor key={distribution.id} distribution={distribution} project={project} eligibleInvestors={eligibleInvestors} />)}</div> : <div className="border-t border-[#232b45] px-5 py-8 text-center text-[13px] text-[#6b7594]">Todavía no hay pagos en {project.name}.</div>}
      </div>
    </section>
  );
}

export function DistributionManager({ data }: { data: DashboardData }) {
  if (data.projects.length === 0) {
    return (
      <section id="new-payment" className="panel scroll-mt-24 p-8 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#4d7cfe]/10 text-[#8fb0ff]"><Building2 size={22} /></span>
        <h2 className="mt-4 text-[17px] font-semibold">Primero crea tu primer proyecto</h2>
        <p className="mx-auto mt-2 max-w-lg text-[13px] leading-5 text-[#7c86a6]">Los pagos siempre pertenecen a un proyecto individual. Al crear uno, esta página mostrará una tarjeta exclusiva para administrarlo.</p>
        <Link href="/admin#new-project" className="primary-button mt-5 px-4"><Plus size={14} />Crear primer proyecto</Link>
      </section>
    );
  }

  return (
    <div id="new-payment" className="scroll-mt-24 space-y-4">
      <section className="panel grid gap-3 p-4 sm:grid-cols-3">
        {[
          ["1", "Proyecto", "Cada pago queda separado por nave."],
          ["2", "Inversionista", "Asígnalo y registra su inversión en MXN."],
          ["3", "Pago", "Captura el monto y adjunta su comprobante."],
        ].map(([number, label, detail]) => <div key={number} className="flex items-start gap-3 rounded-xl bg-[#0d1324] p-3"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#4d7cfe] text-[12px] font-bold text-white">{number}</span><div><p className="text-[13px] font-semibold">{label}</p><p className="mt-1 text-[12px] leading-4 text-[#6b7594]">{detail}</p></div></div>)}
      </section>
      {data.projects.map((project) => <ProjectPayments key={project.id} data={data} project={project} />)}
    </div>
  );
}
