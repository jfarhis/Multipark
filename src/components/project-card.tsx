import Link from "next/link";
import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import type { DashboardData, InvestorProjectStake, Project } from "@/lib/types";
import { capitalForStake, compactMoney, completionLabel, distributionsForStake, projectRaised } from "@/lib/calculations";
import { ProgressBar } from "./progress-bar";
import { StatusBadge } from "./status-badge";

export function ProjectCard({ project, data, stake }: { project: Project; data: DashboardData; stake?: InvestorProjectStake }) {
  const capital = stake ? capitalForStake(stake) : projectRaised(data, project.id);
  const distributed = stake ? distributionsForStake(data, stake) : data.distributions.filter((item) => item.projectId === project.id).reduce((sum, item) => sum + item.amount, 0);
  return (
    <Link href={`/projects/${project.id}`} className="panel panel-hover group block p-5">
      <div className="flex items-start justify-between gap-3"><div><StatusBadge status={project.status} /><h3 className="mt-4 text-[16px] font-semibold tracking-[-0.02em]">{project.name}</h3><p className="mt-1.5 flex items-center gap-1.5 text-[10px] text-[#8585a7]"><MapPin size={11} />{project.location}</p></div><span className="grid size-9 place-items-center rounded-xl bg-[#24244e] text-[#8787aa] transition group-hover:bg-[#6c5ce7] group-hover:text-white"><ArrowUpRight size={15} /></span></div>
      <div className="mt-6"><div className="mb-2 flex items-center justify-between text-[10px]"><span className="text-[#8989aa]">Construction progress</span><span className="tabular font-semibold">{project.constructionPct}%</span></div><ProgressBar value={project.constructionPct} color={project.status === "delayed" ? "#e84f6f" : "#6c5ce7"} /></div>
      <div className="mt-5 grid grid-cols-3 gap-2 border-t border-[#2c2c54]/65 pt-4"><div><p className="text-[9px] text-[#7f7fa1]">{stake ? "Your stake" : "Raised"}</p><p className="tabular mt-1 text-[12px] font-semibold">{stake ? `${stake.stakePct}%` : compactMoney.format(capital)}</p></div><div><p className="text-[9px] text-[#7f7fa1]">{stake ? "Your capital" : "Distributed"}</p><p className="tabular mt-1 text-[12px] font-semibold">{compactMoney.format(stake ? capital : distributed)}</p></div><div><p className="text-[9px] text-[#7f7fa1]">Projected IRR</p><p className="tabular mt-1 text-[12px] font-semibold text-[#4fe8b8]">{project.projectedIrr}%</p></div></div>
      <p className="mt-4 flex items-center gap-1.5 text-[9px] text-[#6f6f94]"><CalendarDays size={10} />Estimated completion {completionLabel(project)}</p>
    </Link>
  );
}
