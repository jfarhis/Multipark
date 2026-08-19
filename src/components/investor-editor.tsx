"use client";

import { Save } from "lucide-react";
import { useActionState } from "react";
import type { DashboardData, Investor } from "@/lib/types";
import { money } from "@/lib/calculations";
import { updateInvestorStakesAction } from "@/app/admin/actions";
import { initialFormState } from "@/lib/form-state";
import { FormMessage } from "./form-message";
import { SubmitButton } from "./submit-button";

export function InvestorEditor({ investor, data }: { investor: Investor; data: DashboardData }) {
  const [state, action] = useActionState(updateInvestorStakesAction.bind(null, investor.id), initialFormState);
  const stakes = new Map(data.stakes.filter((stake) => stake.investorId === investor.id).map((stake) => [stake.projectId, stake]));
  return (
    <form action={action} className="panel overflow-hidden"><div className="border-b border-white/6 p-5"><p className="text-[13px] font-semibold">Project ownership</p><p className="mt-1 text-[10px] text-[#7e8983]">Enter a percentage to add a position. Set it to zero to remove the position.</p></div><div className="divide-y divide-white/6">{data.projects.map((project) => { const stakePct = stakes.get(project.id)?.stakePct ?? 0; return <div key={project.id} className="grid items-center gap-4 p-5 sm:grid-cols-[1fr_110px_150px]"><div><p className="text-[12px] font-medium">{project.name}</p><p className="mt-1 text-[9px] text-[#727e78]">{project.location}</p></div><label className="field-label">Stake %<input name={`stake:${project.id}`} className="input-shell mt-1.5 h-9 px-3 text-[11px]" defaultValue={stakePct} type="number" min="0" max="100" step="0.1" /></label><div className="sm:text-right"><p className="text-[9px] text-[#727e78]">Calculated capital</p><p className="tabular mt-1.5 text-[12px] font-semibold">{money.format(project.budgetTotal * (stakePct / 100))}</p></div></div>; })}</div><div className="flex items-center justify-between gap-3 border-t border-white/6 p-4"><FormMessage state={state} /><SubmitButton pendingLabel="Saving…"><Save size={14} />Save ownership</SubmitButton></div></form>
  );
}
