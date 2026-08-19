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
    <Link href={`/projects/${project.id}`} className="panel panel-hover group block p-4">
      <div className="flex items-start justify-between gap-3"><div><StatusBadge status={project.status} /><h3 className="mt-3 text-[14px] font-semibold tracking-[-0.02em]">{project.name}</h3><p className="mt-1.5 flex items-center gap-1.5 text-[9px] text-[#96725f]"><MapPin size={10} />{project.location}</p></div><span className="grid size-8 place-items-center rounded-lg bg-[#2c1613] text-[#a3806f] transition group-hover:bg-[#ff7a2f] group-hover:text-white"><ArrowUpRight size={14} /></span></div>
      <div className="mt-5"><div className="mb-2 flex items-center justify-between text-[9px]"><span className="text-[#a3806f]">Avance de obra</span><span className="tabular font-semibold">{project.constructionPct}%</span></div><ProgressBar value={project.constructionPct} color={project.status === "delayed" ? "#ff5470" : "#ff7a2f"} /></div>
      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[#35201a] pt-4"><div><p className="text-[8px] text-[#96725f]">{stake ? "Tu participación" : "Capital captado"}</p><p className="tabular mt-1 text-[10px] font-semibold">{stake ? `${stake.stakePct}%` : compactMoney.format(capital)}</p></div><div><p className="text-[8px] text-[#96725f]">{stake ? "Tu capital" : "Distribuido"}</p><p className="tabular mt-1 text-[10px] font-semibold">{compactMoney.format(stake ? capital : distributed)}</p></div><div><p className="text-[8px] text-[#96725f]">TIR proyectada</p><p className="tabular mt-1 text-[10px] font-semibold text-[#ffc46b]">{project.projectedIrr}%</p></div></div>
      <p className="mt-3 flex items-center gap-1.5 text-[8px] text-[#82604e]"><CalendarDays size={9} />Terminación estimada: {completionLabel(project)}</p>
    </Link>
  );
}
