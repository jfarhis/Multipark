import Link from "next/link";
import Image from "next/image";
import { CalendarDays, Camera, ChevronRight, Download, ExternalLink, MapPin } from "lucide-react";
import type { DashboardData, Project, Session } from "@/lib/types";
import { capitalForStake, compactMoney, completionLabel, distributionsForStake, monthlyDistributionSeries, projectRaised } from "@/lib/calculations";
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
  const progressPhotos = visibleDocuments.filter((document) => document.type === "photo" && document.fileUrl.startsWith("/"));
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(project.location)}`;
  const visibleDistributionRows = data.distributions.filter((item) => item.projectId === project.id && (session.role === "admin" || item.investorId === session.investorId)).toSorted((a, b) => a.date.localeCompare(b.date));
  const monthlySeries = monthlyDistributionSeries(visibleDistributionRows).slice(-12);
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
      <div className="mb-5 flex items-center gap-1.5 text-[13px] text-[#6b7594]"><Link href={session.role === "admin" ? "/admin" : "/dashboard"}>Portafolio</Link><ChevronRight size={11} /><span className="text-[#aab3cf]">{project.name}</span></div>
      <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><div className="flex items-center gap-2.5"><StatusBadge status={project.status} />{investorStake ? <span className="rounded-full bg-[#4d7cfe]/10 px-2.5 py-1 text-[13px] font-semibold text-[#8fb0ff]">Tu participación: {investorStake.stakePct}%</span> : null}</div><h1 className="mt-4 text-[25px] font-medium tracking-[-0.035em]">{project.name}</h1><p className="mt-2 flex items-center gap-1.5 text-[14px] text-[#7c86a6]"><MapPin size={12} />{project.location}</p></div><ExportButton filename={`${project.id}-resumen-inversion.csv`} rows={summaryRows} label="Resumen de inversión" /></section>
      {session.role === "admin" ? <ProjectEditForm project={project} /> : null}
      <section className="panel mt-5 flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#4d7cfe]/10 text-[#8fb0ff]"><MapPin size={18} /></span><div><p className="text-[14px] font-semibold">Ubicación de las naves industriales</p><p className="mt-1 text-[13px] leading-5 text-[#8a93b2]">{project.location}</p></div></div>
        <div className="flex flex-wrap gap-2"><a href={mapsHref} target="_blank" rel="noreferrer" className="secondary-button px-3">Abrir en Google Maps<ExternalLink size={13} /></a>{session.role === "admin" ? <Link href="/admin/documents#upload-update" className="primary-button px-3"><Camera size={14} />Agregar fotos de avance</Link> : null}</div>
      </section>
      <section className="panel mt-6 grid divide-y divide-[#232b45] sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-5">{stats.map(([label, value]) => <div key={label} className="p-4"><p className="text-[12px] text-[#7c86a6]">{label}</p><p className="tabular mt-2 text-[16px] font-semibold">{value}</p></div>)}</section>
      <section className="mt-4 grid gap-4 xl:grid-cols-[1.45fr_1fr]">
        <article className="panel p-5"><div className="flex items-start justify-between"><div><p className="text-[13px] font-semibold">Historial de pagos</p><p className="mt-1 text-[13px] text-[#7c86a6]">{investorStake ? "Pagos recibidos por tu participación" : "Pagos de todos los inversionistas del proyecto"}</p></div><p className="tabular text-[13px] font-semibold text-[#2dd4a7]">{compactMoney.format(distributed)}</p></div><div className="mt-5 h-[250px]">{monthlySeries.length ? <DistributionLineChart values={monthlySeries.map((item) => item.amount)} labels={monthlySeries.map((item) => item.label)} cumulative={monthlySeries.map((item) => item.cumulative)} /> : <div className="grid h-full place-items-center text-[13px] text-[#6b7594]">Todavía no hay pagos registrados.</div>}</div></article>
        <article className="panel p-5"><p className="text-[13px] font-semibold">Distribución del presupuesto</p><p className="mt-1 text-[13px] text-[#7c86a6]">Asignación por categoría</p><div className="mt-6"><BudgetDonutChart items={project.budgetBreakdown} /></div></article>
      </section>
      <section className="mt-4 grid gap-4 xl:grid-cols-[1fr_1.4fr]">
        <article className="panel p-5"><p className="text-[13px] font-semibold">Línea de tiempo</p><p className="mt-1 text-[13px] text-[#7c86a6]">Plan y avance del proyecto</p>{project.milestones.length ? <div className="mt-6 space-y-0">{project.milestones.map((milestone, index) => <div key={`${milestone.label}-${index}`} className="relative flex gap-3 pb-6 last:pb-0"><div className={`relative z-10 mt-0.5 size-3 rounded-full ring-4 ring-[#161d33] ${milestone.complete ? "bg-[#2dd4a7]" : "bg-[#3b5bfe]"}`} />{index < project.milestones.length - 1 ? <div className="absolute left-[5px] top-3 h-full w-px bg-[#2a3554]" /> : null}<div><p className="text-[14px] font-medium">{milestone.label}</p><p className="mt-1 text-[12px] text-[#74827a]">{milestone.detail}</p></div></div>)}</div> : <div className="grid min-h-44 place-items-center text-center text-[13px] text-[#6b7594]">Agrega los hitos desde “Editar este proyecto”.</div>}</article>
        <article className="panel overflow-hidden"><div className="flex items-center justify-between border-b border-[#232b45] p-5"><div><p className="text-[13px] font-semibold">{session.role === "admin" ? "Inversionistas del proyecto" : "Tu participación"}</p><p className="mt-1 text-[13px] text-[#7c86a6]">{visibleStakes.length} {visibleStakes.length === 1 ? "participación" : "inversionistas"}</p></div></div><div className="overflow-x-auto"><table className="w-full min-w-[580px] text-left"><thead className="bg-[#161d33] text-[12px] uppercase tracking-wider text-[#596382]"><tr><th className="px-5 py-3 font-medium">Inversionista</th><th className="px-4 py-3 text-right font-medium">Participación</th><th className="px-4 py-3 text-right font-medium">Capital</th><th className="px-5 py-3 text-right font-medium">Pagado a la fecha</th></tr></thead><tbody>{visibleStakes.map((stake) => { const investor = data.investors.find((item) => item.id === stake.investorId)!; return <tr key={stake.investorId} className="table-row border-t border-[#232b45]/70 text-[14px]"><td className="px-5 py-3.5"><div className="flex items-center gap-2.5"><span className="grid size-7 place-items-center rounded-lg bg-[#1b2547] text-[12px] text-[#8fb0ff]">{investor.name.split(" ").map((word) => word[0]).join("")}</span><span>{investor.name}</span></div></td><td className="tabular px-4 py-3.5 text-right">{stake.stakePct}%</td><td className="tabular px-4 py-3.5 text-right">{compactMoney.format(capitalForStake(stake))}</td><td className="tabular px-5 py-3.5 text-right text-[#2dd4a7]">{compactMoney.format(distributionsForStake(data, stake))}</td></tr>; })}</tbody></table></div>{visibleStakes.length === 0 ? <div className="p-10 text-center text-[14px] text-[#7c86a6]">Todavía no hay participaciones en este proyecto.</div> : null}</article>
      </section>
      <section className="panel mt-4 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[#232b45] p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[16px] font-semibold">Avances fotográficos</p><p className="mt-1 text-[13px] text-[#7c86a6]">Evidencia visual de la construcción y evolución de las naves.</p></div>{session.role === "admin" ? <Link href="/admin/documents#upload-update" className="secondary-button px-3"><Camera size={14} />Publicar nueva foto</Link> : null}</div>
        {progressPhotos.length ? <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">{progressPhotos.slice(0, 6).map((photo) => <a key={photo.id} href={photo.fileUrl} className="group overflow-hidden rounded-xl border border-[#232b45] bg-[#0e1425]"><div className="relative aspect-video overflow-hidden bg-[#080d1b]"><Image unoptimized src={photo.fileUrl} alt={photo.title} width={640} height={360} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" /></div><div className="p-3"><p className="truncate text-[14px] font-semibold">{photo.title}</p><p className="mt-1 text-[12px] text-[#7c86a6]">{photo.uploadedDate}</p></div></a>)}</div> : <div className="grid min-h-44 place-items-center p-8 text-center"><div><Camera className="mx-auto text-[#596382]" size={28} /><p className="mt-3 text-[14px] font-semibold">Todavía no hay fotos de avance</p><p className="mt-1 text-[13px] text-[#7c86a6]">{session.role === "admin" ? "Publica la primera foto para que los inversionistas puedan seguir la obra." : "Tu administrador publicará aquí las próximas actualizaciones de construcción."}</p></div></div>}
      </section>
      <section className="panel mt-4 overflow-hidden">
        <div className="border-b border-[#232b45] p-5"><p className="text-[13px] font-semibold">Documentos del proyecto</p><p className="mt-1 text-[13px] text-[#7c86a6]">Reportes, comprobantes y avances de obra</p></div>
        <div className="divide-y divide-[#232b45]">
          {visibleDocuments.slice(0, 5).map((document) => document.fileUrl !== "#" ? (
            <a key={document.id} href={document.fileUrl} className="table-row group grid w-full grid-cols-[40px_minmax(0,1fr)_36px] items-center gap-3 px-4 py-3.5 sm:px-5" aria-label={`Abrir ${document.title}`}>
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#1b2547] text-[13px] font-semibold uppercase text-[#8fb0ff]">{document.type.slice(0, 1)}</span>
              <span className="min-w-0"><span className="block truncate text-[14px] font-medium">{document.title}</span><span className="mt-1 block text-[12px] text-[#6b7594]">{documentTypeLabels[document.type]} · {document.uploadedDate}</span></span>
              <span className="grid size-8 place-items-center rounded-lg bg-[#1a2340] text-[#7c86a6] transition group-hover:bg-[#4d7cfe] group-hover:text-white"><Download size={13} /></span>
            </a>
          ) : (
            <div key={document.id} className="grid w-full grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3.5 sm:px-5">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#1b2547] text-[13px] font-semibold uppercase text-[#8fb0ff]">{document.type.slice(0, 1)}</span>
              <span className="min-w-0"><span className="block truncate text-[14px] font-medium">{document.title}</span><span className="mt-1 block text-[12px] text-[#6b7594]">{documentTypeLabels[document.type]} · {document.uploadedDate}</span></span>
              <span className="rounded-md bg-[#2a2115] px-2 py-1 text-[11px] text-[#d6aa57]">Archivo pendiente</span>
            </div>
          ))}
        </div>
        {visibleDocuments.length === 0 ? <div className="p-10 text-center text-[14px] text-[#6b7594]">Todavía no hay documentos disponibles.</div> : null}
      </section>
      <div className="mt-6 flex items-center gap-2 text-[13px] text-[#6b7594]"><CalendarDays size={12} />Los datos se cargan directamente desde la base segura de tu cuenta.</div>
    </>
  );
}
