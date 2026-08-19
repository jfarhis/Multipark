import Link from "next/link";
import { CalendarDays, ChevronRight, Download, MapPin } from "lucide-react";
import type { DashboardData, Project, Session } from "@/lib/types";
import { capitalForStake, compactMoney, completionLabel, distributionsForStake, projectRaised } from "@/lib/calculations";
import { BudgetDonutChart, DistributionLineChart } from "./charts";
import { ExportButton } from "./export-button";
import { StatusBadge } from "./status-badge";

export function ProjectDetail({ data, project, session }: { data: DashboardData; project: Project; session: Session }) {
  const investorStake = session.role === "investor" ? data.stakes.find((stake) => stake.projectId === project.id && stake.investorId === session.investorId) : undefined;
  const projectStakes = data.stakes.filter((stake) => stake.projectId === project.id);
  const visibleStakes = session.role === "admin" ? projectStakes : investorStake ? [investorStake] : [];
  const raised = investorStake ? capitalForStake(investorStake) : projectRaised(data, project.id);
  const distributed = investorStake ? distributionsForStake(data, investorStake) : data.distributions.filter((item) => item.projectId === project.id).reduce((sum, item) => sum + item.amount, 0);
  const visibleDocuments = data.documents.filter((document) => document.projectId === project.id && (session.role === "admin" || document.investorId === null || document.investorId === session.investorId));
  const visibleDistributionRows = data.distributions.filter((item) => item.projectId === project.id && (session.role === "admin" || item.investorId === session.investorId)).toSorted((a, b) => a.date.localeCompare(b.date));
  const recentDistributionRows = visibleDistributionRows.slice(-7);
  const distributionValues = recentDistributionRows.map((item) => Math.round(item.amount / 1000));
  const distributionLabels = recentDistributionRows.map((item) => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(`${item.date}T12:00:00`)));
  const stats = [
    ["Construction", `${project.constructionPct}%`],
    ["Occupancy", `${project.occupancyPct}%`],
    [investorStake ? "Your capital" : "Capital raised", compactMoney.format(raised)],
    ["Projected IRR", `${project.projectedIrr}%`],
    ["Est. completion", completionLabel(project)],
  ];
  const summaryRows = stats.map(([label, value]) => ({ Metric: label, Value: value }));
  return (
    <>
      <div className="mb-5 flex items-center gap-1.5 text-[10px] text-[#717196]"><Link href={session.role === "admin" ? "/admin" : "/dashboard"}>Portfolio</Link><ChevronRight size={11} /><span className="text-[#a0a0bd]">{project.name}</span></div>
      <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><div className="flex items-center gap-2.5"><StatusBadge status={project.status} />{investorStake ? <span className="rounded-full bg-[#22c9a5]/10 px-2.5 py-1 text-[10px] font-semibold text-[#54d9bd]">Your stake: {investorStake.stakePct}%</span> : null}</div><h1 className="mt-4 text-[25px] font-medium tracking-[-0.035em]">{project.name}</h1><p className="mt-2 flex items-center gap-1.5 text-[11px] text-[#7d8a82]"><MapPin size={12} />{project.location}</p></div><ExportButton filename={`${project.id}-investment-summary.csv`} rows={summaryRows} label="Investment summary" /></section>
      <section className="panel mt-6 grid divide-y divide-[#2c2c54]/65 sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-5">{stats.map(([label, value]) => <div key={label} className="p-4"><p className="text-[9px] text-[#8181a3]">{label}</p><p className="tabular mt-2 text-[16px] font-semibold">{value}</p></div>)}</section>
      <section className="mt-4 grid gap-4 xl:grid-cols-[1.45fr_1fr]">
        <article className="panel p-5"><div className="flex items-start justify-between"><div><p className="text-[13px] font-semibold">Distribution history</p><p className="mt-1 text-[10px] text-[#8181a3]">{investorStake ? "Payments received for your position" : "Aggregate payments across project investors"}</p></div><p className="tabular text-[13px] font-semibold text-[#4fe8b8]">{compactMoney.format(distributed)}</p></div><div className="mt-5 h-[250px]"><DistributionLineChart values={distributionValues} labels={distributionLabels} /></div></article>
        <article className="panel p-5"><p className="text-[13px] font-semibold">Budget allocation</p><p className="mt-1 text-[10px] text-[#8181a3]">Sources and uses by category</p><div className="mt-6"><BudgetDonutChart items={project.budgetBreakdown} /></div></article>
      </section>
      <section className="mt-4 grid gap-4 xl:grid-cols-[1fr_1.4fr]">
        <article className="panel p-5"><p className="text-[13px] font-semibold">Milestone timeline</p><p className="mt-1 text-[10px] text-[#8181a3]">Delivery plan and current position</p><div className="mt-6 space-y-0">{[["Land acquisition", "Complete", true], ["Permits & design", "Complete", true], ["Structural works", `${project.constructionPct}% complete`, project.constructionPct > 45], ["Interior & MEP", "In progress", project.constructionPct > 70], ["Handover", completionLabel(project), false]].map(([label, detail, complete], index) => <div key={String(label)} className="relative flex gap-3 pb-6 last:pb-0"><div className={`relative z-10 mt-0.5 size-3 rounded-full ring-4 ring-[#1a1a3a] ${complete ? "bg-[#4fe8b8]" : index === 2 ? "bg-[#6c5ce7]" : "bg-[#3a3a67]"}`} />{index < 4 && <div className="absolute left-[5px] top-3 h-full w-px bg-[#30305c]" />}<div><p className="text-[11px] font-medium">{label}</p><p className="mt-1 text-[9px] text-[#7e7ea1]">{detail}</p></div></div>)}</div></article>
        <article className="panel overflow-hidden"><div className="flex items-center justify-between border-b border-[#2c2c54]/60 p-5"><div><p className="text-[13px] font-semibold">{session.role === "admin" ? "Project investors" : "Your position"}</p><p className="mt-1 text-[10px] text-[#8181a3]">{visibleStakes.length} {visibleStakes.length === 1 ? "position" : "investors"}</p></div></div><div className="overflow-x-auto"><table className="w-full min-w-[580px] text-left"><thead className="bg-[#171734] text-[9px] uppercase tracking-wider text-[#77779a]"><tr><th className="px-5 py-3 font-medium">Investor</th><th className="px-4 py-3 text-right font-medium">Stake</th><th className="px-4 py-3 text-right font-medium">Capital</th><th className="px-5 py-3 text-right font-medium">Paid to date</th></tr></thead><tbody>{visibleStakes.map((stake) => { const investor = data.investors.find((item) => item.id === stake.investorId)!; return <tr key={stake.investorId} className="table-row border-t border-[#2c2c54]/40 text-[11px]"><td className="px-5 py-3.5"><div className="flex items-center gap-2.5"><span className="grid size-7 place-items-center rounded-lg bg-[#292957] text-[9px] text-[#aaa0ff]">{investor.name.split(" ").map((word) => word[0]).join("")}</span><span>{investor.name}</span></div></td><td className="tabular px-4 py-3.5 text-right">{stake.stakePct}%</td><td className="tabular px-4 py-3.5 text-right">{compactMoney.format(capitalForStake(stake))}</td><td className="tabular px-5 py-3.5 text-right text-[#4fe8b8]">{compactMoney.format(distributionsForStake(data, stake))}</td></tr>; })}</tbody></table></div>{visibleStakes.length === 0 && <div className="p-10 text-center text-[11px] text-[#8181a3]">You do not hold a position in this project.</div>}</article>
      </section>
      <section className="panel mt-4 overflow-hidden"><div className="border-b border-[#2c2c54]/60 p-5"><p className="text-[13px] font-semibold">Project documents</p><p className="mt-1 text-[10px] text-[#8181a3]">Reports, receipts, and construction updates</p></div><div className="divide-y divide-[#2c2c54]/45">{visibleDocuments.slice(0, 5).map((document) => <a key={document.id} href={document.fileUrl} className="table-row flex items-center gap-3 px-5 py-3.5"><span className="grid size-8 place-items-center rounded-lg bg-[#262652] text-[10px] font-semibold uppercase text-[#9f93ff]">{document.type.slice(0, 1)}</span><div className="min-w-0 flex-1"><p className="truncate text-[11px] font-medium">{document.title}</p><p className="mt-1 text-[9px] text-[#77779a]">{document.type} · {document.uploadedDate}</p></div><Download size={14} className="text-[#747498]" /></a>)}</div>{visibleDocuments.length === 0 && <div className="p-10 text-center text-[11px] text-[#8181a3]">No documents are available yet.</div>}</section>
      <div className="mt-6 flex items-center gap-2 text-[10px] text-[#68766e]"><CalendarDays size={12} />Portfolio data loads directly from the secure account database.</div>
    </>
  );
}
