import Link from "next/link";
import { CalendarDays, ChevronRight, Download, MapPin } from "lucide-react";
import type { DashboardData, Project, Session } from "@/lib/types";
import { capitalForStake, compactMoney, completionLabel, distributionsForStake, projectRaised } from "@/lib/calculations";
import { BudgetDonutChart, DistributionLineChart } from "./charts";
import { ExportButton } from "./export-button";
import { ProjectEditForm } from "./project-edit-form";
import { StatusBadge } from "./status-badge";

const documentTypeLabels = { receipt: "Comprobante", report: "Reporte", photo: "Foto" } as const;

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
  const distributionLabels = recentDistributionRows.map((item) => new Intl.DateTimeFormat("es-MX", { month: "short", day: "numeric" }).format(new Date(`${item.date}T12:00:00`)));
  const stats = [
    ["Avance de obra", `${project.constructionPct}%`],
    ["Ocupación", `${project.occupancyPct}%`],
    [investorStake ? "Tu capital" : "Capital captado", compactMoney.format(raised)],
    ["TIR proyectada", `${project.projectedIrr}%`],
    ["Terminación estimada", completionLabel(project)],
  ];
  const summaryRows = stats.map(([label, value]) => ({ Indicador: label, Valor: value }));
  return (
    <>
      <div className="mb-5 flex items-center gap-1.5 text-[10px] text-[#717196]"><Link href={session.role === "admin" ? "/admin" : "/dashboard"}>Portafolio</Link><ChevronRight size={11} /><span className="text-[#a0a0bd]">{project.name}</span></div>
      <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><div className="flex items-center gap-2.5"><StatusBadge status={project.status} />{investorStake ? <span className="rounded-full bg-[#22c9a5]/10 px-2.5 py-1 text-[10px] font-semibold text-[#54d9bd]">Tu participación: {investorStake.stakePct}%</span> : null}</div><h1 className="mt-4 text-[25px] font-medium tracking-[-0.035em]">{project.name}</h1><p className="mt-2 flex items-center gap-1.5 text-[11px] text-[#7d8a82]"><MapPin size={12} />{project.location}</p></div><ExportButton filename={`${project.id}-resumen-inversion.csv`} rows={summaryRows} label="Resumen de inversión" /></section>
      {session.role === "admin" ? <ProjectEditForm project={project} /> : null}
      <section className="panel mt-6 grid divide-y divide-[#2c2c54]/65 sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-5">{stats.map(([label, value]) => <div key={label} className="p-4"><p className="text-[9px] text-[#8181a3]">{label}</p><p className="tabular mt-2 text-[16px] font-semibold">{value}</p></div>)}</section>
      <section className="mt-4 grid gap-4 xl:grid-cols-[1.45fr_1fr]">
        <article className="panel p-5"><div className="flex items-start justify-between"><div><p className="text-[13px] font-semibold">Historial de distribuciones</p><p className="mt-1 text-[10px] text-[#8181a3]">{investorStake ? "Pagos recibidos por tu participación" : "Pagos de todos los inversionistas del proyecto"}</p></div><p className="tabular text-[13px] font-semibold text-[#4fe8b8]">{compactMoney.format(distributed)}</p></div><div className="mt-5 h-[250px]">{distributionValues.length ? <DistributionLineChart values={distributionValues} labels={distributionLabels} /> : <div className="grid h-full place-items-center text-[10px] text-[#718078]">Todavía no hay distribuciones.</div>}</div></article>
        <article className="panel p-5"><p className="text-[13px] font-semibold">Distribución del presupuesto</p><p className="mt-1 text-[10px] text-[#8181a3]">Asignación por categoría</p><div className="mt-6"><BudgetDonutChart items={project.budgetBreakdown} /></div></article>
      </section>
      <section className="mt-4 grid gap-4 xl:grid-cols-[1fr_1.4fr]">
        <article className="panel p-5"><p className="text-[13px] font-semibold">Línea de tiempo</p><p className="mt-1 text-[10px] text-[#8181a3]">Plan y avance del proyecto</p>{project.milestones.length ? <div className="mt-6 space-y-0">{project.milestones.map((milestone, index) => <div key={`${milestone.label}-${index}`} className="relative flex gap-3 pb-6 last:pb-0"><div className={`relative z-10 mt-0.5 size-3 rounded-full ring-4 ring-[#1a1a3a] ${milestone.complete ? "bg-[#4fe8b8]" : "bg-[#6c5ce7]"}`} />{index < project.milestones.length - 1 ? <div className="absolute left-[5px] top-3 h-full w-px bg-[#30305c]" /> : null}<div><p className="text-[11px] font-medium">{milestone.label}</p><p className="mt-1 text-[9px] text-[#7e7ea1]">{milestone.detail}</p></div></div>)}</div> : <div className="grid min-h-44 place-items-center text-center text-[10px] text-[#718078]">Agrega los hitos desde “Editar este proyecto”.</div>}</article>
        <article className="panel overflow-hidden"><div className="flex items-center justify-between border-b border-[#2c2c54]/60 p-5"><div><p className="text-[13px] font-semibold">{session.role === "admin" ? "Inversionistas del proyecto" : "Tu participación"}</p><p className="mt-1 text-[10px] text-[#8181a3]">{visibleStakes.length} {visibleStakes.length === 1 ? "participación" : "inversionistas"}</p></div></div><div className="overflow-x-auto"><table className="w-full min-w-[580px] text-left"><thead className="bg-[#171734] text-[9px] uppercase tracking-wider text-[#77779a]"><tr><th className="px-5 py-3 font-medium">Inversionista</th><th className="px-4 py-3 text-right font-medium">Participación</th><th className="px-4 py-3 text-right font-medium">Capital</th><th className="px-5 py-3 text-right font-medium">Pagado a la fecha</th></tr></thead><tbody>{visibleStakes.map((stake) => { const investor = data.investors.find((item) => item.id === stake.investorId)!; return <tr key={stake.investorId} className="table-row border-t border-[#2c2c54]/40 text-[11px]"><td className="px-5 py-3.5"><div className="flex items-center gap-2.5"><span className="grid size-7 place-items-center rounded-lg bg-[#292957] text-[9px] text-[#aaa0ff]">{investor.name.split(" ").map((word) => word[0]).join("")}</span><span>{investor.name}</span></div></td><td className="tabular px-4 py-3.5 text-right">{stake.stakePct}%</td><td className="tabular px-4 py-3.5 text-right">{compactMoney.format(capitalForStake(stake))}</td><td className="tabular px-5 py-3.5 text-right text-[#4fe8b8]">{compactMoney.format(distributionsForStake(data, stake))}</td></tr>; })}</tbody></table></div>{visibleStakes.length === 0 ? <div className="p-10 text-center text-[11px] text-[#8181a3]">Todavía no hay participaciones en este proyecto.</div> : null}</article>
      </section>
      <section className="panel mt-4 overflow-hidden">
        <div className="border-b border-[#202b25] p-5"><p className="text-[13px] font-semibold">Documentos del proyecto</p><p className="mt-1 text-[10px] text-[#748078]">Reportes, comprobantes y avances de obra</p></div>
        <div className="divide-y divide-[#202b25]">
          {visibleDocuments.slice(0, 5).map((document) => document.fileUrl !== "#" ? (
            <a key={document.id} href={document.fileUrl} className="table-row group grid w-full grid-cols-[40px_minmax(0,1fr)_36px] items-center gap-3 px-4 py-3.5 sm:px-5" aria-label={`Abrir ${document.title}`}>
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#211d3b] text-[10px] font-semibold uppercase text-[#aa99ff]">{document.type.slice(0, 1)}</span>
              <span className="min-w-0"><span className="block truncate text-[11px] font-medium">{document.title}</span><span className="mt-1 block text-[9px] text-[#718078]">{documentTypeLabels[document.type]} · {document.uploadedDate}</span></span>
              <span className="grid size-8 place-items-center rounded-lg bg-[#17211b] text-[#77867d] transition group-hover:bg-[#8b72ff] group-hover:text-white"><Download size={13} /></span>
            </a>
          ) : (
            <div key={document.id} className="grid w-full grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3.5 sm:px-5">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#211d3b] text-[10px] font-semibold uppercase text-[#aa99ff]">{document.type.slice(0, 1)}</span>
              <span className="min-w-0"><span className="block truncate text-[11px] font-medium">{document.title}</span><span className="mt-1 block text-[9px] text-[#718078]">{documentTypeLabels[document.type]} · {document.uploadedDate}</span></span>
              <span className="rounded-md bg-[#2a2115] px-2 py-1 text-[8px] text-[#d6aa57]">Archivo pendiente</span>
            </div>
          ))}
        </div>
        {visibleDocuments.length === 0 ? <div className="p-10 text-center text-[11px] text-[#718078]">Todavía no hay documentos disponibles.</div> : null}
      </section>
      <div className="mt-6 flex items-center gap-2 text-[10px] text-[#68766e]"><CalendarDays size={12} />Los datos se cargan directamente desde la base segura de tu cuenta.</div>
    </>
  );
}
