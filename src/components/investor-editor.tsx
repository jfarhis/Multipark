"use client";

import { Save } from "lucide-react";
import { useActionState, useState } from "react";
import type { DashboardData, Investor } from "@/lib/types";
import { money } from "@/lib/calculations";
import { updateInvestorStakesAction } from "@/app/admin/actions";
import { initialFormState } from "@/lib/form-state";
import { FormMessage } from "./form-message";
import { SubmitButton } from "./submit-button";

export function InvestorEditor({ investor, data }: { investor: Investor; data: DashboardData }) {
  const [state, action] = useActionState(updateInvestorStakesAction.bind(null, investor.id), initialFormState);
  const stakes = new Map(data.stakes.filter((stake) => stake.investorId === investor.id).map((stake) => [stake.projectId, stake]));
  const [capitalByProject, setCapitalByProject] = useState<Record<string, number>>(() => Object.fromEntries(data.projects.map((project) => [project.id, stakes.get(project.id)?.capitalCommitted ?? 0])));
  return (
    <form action={action} className="panel overflow-hidden"><div className="border-b border-white/6 p-5"><p className="text-[16px] font-semibold">2. Registrar la inversión en pesos mexicanos</p><p className="mt-1 text-[13px] leading-5 text-[#7c86a6]">Escribe el capital realmente invertido en cada proyecto. El porcentaje cambia mientras escribes. Usa cero para eliminar una inversión.</p></div><div className="divide-y divide-white/6">{data.projects.map((project) => { const capitalCommitted = capitalByProject[project.id] ?? 0; const stakePct = project.budgetTotal ? (capitalCommitted / project.budgetTotal) * 100 : 0; return <div key={project.id} className="grid items-center gap-4 p-5 sm:grid-cols-[1fr_220px_170px]"><div><p className="text-[15px] font-medium">{project.name}</p><p className="mt-1 text-[15px] text-[#7c86a6]">{project.location}</p><p className="mt-2 text-[15px] text-[#596382]">Presupuesto total: {money.format(project.budgetTotal)}</p></div><label className="field-label">Capital invertido (MXN)<input name={`capital:${project.id}`} className="input-shell mt-1.5 h-11 px-3 text-[14px]" value={capitalCommitted} onChange={(event) => setCapitalByProject((current) => ({ ...current, [project.id]: Number(event.target.value) }))} type="number" min="0" max={project.budgetTotal} step="1" /></label><div className="rounded-xl border border-[#232b45] bg-[#0e1425] p-3 sm:text-right"><p className="text-[15px] text-[#7c86a6]">Participación calculada</p><p className="tabular mt-1.5 text-[16px] font-semibold text-[#8fb0ff]">{stakePct.toFixed(2)}%</p></div></div>; })}{data.projects.length === 0 ? <div className="p-10 text-center text-[13px] text-[#7c86a6]">Primero crea un proyecto para registrar la inversión.</div> : null}</div><div className="flex flex-col-reverse gap-3 border-t border-white/6 p-4 sm:flex-row sm:items-center sm:justify-between"><FormMessage state={state} /><SubmitButton pendingLabel="Guardando inversión…"><Save size={14} />Guardar inversiones</SubmitButton></div></form>
  );
}
