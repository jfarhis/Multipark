"use client";

import { Check, Save } from "lucide-react";
import { useState } from "react";
import type { DashboardData, Investor } from "@/lib/types";
import { capitalForStake, money } from "@/lib/calculations";

export function InvestorEditor({ investor, data }: { investor: Investor; data: DashboardData }) {
  const [saved, setSaved] = useState(false);
  const stakes = data.stakes.filter((stake) => stake.investorId === investor.id);
  return (
    <section className="panel overflow-hidden"><div className="border-b border-[#2c2c54]/60 p-5"><p className="text-[13px] font-semibold">Project ownership</p><p className="mt-1 text-[10px] text-[#8181a3]">Edit the investor&apos;s stake percentage per project.</p></div><div className="divide-y divide-[#2c2c54]/45">{stakes.map((stake) => { const project = data.projects.find((item) => item.id === stake.projectId)!; return <div key={stake.projectId} className="grid items-center gap-4 p-5 sm:grid-cols-[1fr_110px_150px]"><div><p className="text-[12px] font-medium">{project.name}</p><p className="mt-1 text-[9px] text-[#7f7fa1]">{project.location}</p></div><label className="text-[9px] text-[#7f7fa1]">Stake %<input className="input-shell mt-1.5 h-9 px-3 text-[11px]" defaultValue={stake.stakePct} type="number" step="0.1" /></label><div className="sm:text-right"><p className="text-[9px] text-[#7f7fa1]">Calculated capital</p><p className="tabular mt-1.5 text-[12px] font-semibold">{money.format(capitalForStake(stake))}</p></div></div>; })}</div><div className="flex justify-end border-t border-[#2c2c54]/60 p-4"><button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 1800); }} className="primary-button px-4">{saved ? <Check size={14} /> : <Save size={14} />}{saved ? "Saved" : "Save ownership"}</button></div></section>
  );
}
