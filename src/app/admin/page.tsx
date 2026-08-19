import Link from "next/link";
import { Building2, FolderPlus, Landmark, Percent, UserPlus, Users, WalletCards } from "lucide-react";
import { DistributionLineChart, PortfolioActivityDonut, ProjectRadarChart } from "@/components/charts";
import { ExportButton } from "@/components/export-button";
import { ExcelImportForm } from "@/components/excel-import-form";
import { KpiCard } from "@/components/kpi-card";
import { PageHeading } from "@/components/page-heading";
import { ProgressBar } from "@/components/progress-bar";
import { ProjectCard } from "@/components/project-card";
import { ProjectCreateForm } from "@/components/project-create-form";
import { StatusBadge } from "@/components/status-badge";
import { compactMoney, distributionTrend, money, monthlyDistributionSeries, portfolioMetrics } from "@/lib/calculations";
import { requireAdminSession } from "@/lib/auth";
import { getDashboardData } from "@/lib/data/repository";

const dateFormatter = new Intl.DateTimeFormat("es-MX", { month: "short", day: "numeric", year: "numeric" });

export default async function AdminOverviewPage() {
  const session = await requireAdminSession();
  const data = await getDashboardData(session);
  const metrics = portfolioMetrics(data);
  const projectById = new Map(data.projects.map((project) => [project.id, project]));
  const investorById = new Map(data.investors.map((investor) => [investor.id, investor]));
  const recentDistributions = data.distributions.toSorted((a, b) => b.date.localeCompare(a.date)).slice(0, 7);
  const monthlySeries = monthlyDistributionSeries(data.distributions).slice(-12);
  const trend = distributionTrend(monthlySeries);
  const exportRows = data.distributions.map((distribution) => ({
    Fecha: distribution.date,
    Proyecto: projectById.get(distribution.projectId)?.name ?? distribution.projectId,
    Inversionista: investorById.get(distribution.investorId)?.name ?? distribution.investorId,
    Monto: distribution.amount,
  }));

  return (
    <>
      <PageHeading
        eyebrow="Centro de control"
        title={`Bienvenido, ${session.name.split(" ")[0]}`}
        description="Capital, proyectos e inversionistas del portafolio Gasfar en un solo lugar."
        action={<ExportButton filename="gasfar-distribuciones.csv" rows={exportRows} label="Exportar reporte" />}
      />

      {data.projects.length === 0 && data.investors.length === 0 ? (
        <section className="panel mb-4 p-6 sm:p-8">
          <p className="eyebrow">Tu espacio está listo</p>
          <h2 className="mt-3 text-[18px] font-semibold">Empieza con tu primer proyecto</h2>
          <p className="mt-2 max-w-2xl text-[11px] leading-5 text-[#7c86a6]">El panel está completamente vacío. Crea un proyecto y después agrega inversionistas, participaciones, distribuciones y documentos.</p>
          <div className="mt-5 flex flex-wrap gap-3"><a href="#new-project" className="primary-button px-4"><FolderPlus size={14} />Crear primer proyecto</a><Link href="/admin/investors#invite-investor" className="secondary-button px-4"><UserPlus size={14} />Agregar inversionista</Link></div>
        </section>
      ) : null}

      <section className="grid gap-3 xl:grid-cols-[1.05fr_1fr]">
        <div className="grid gap-3 sm:grid-cols-2">
          <KpiCard label="Capital invertido" value={compactMoney.format(metrics.totalInvested)} icon={Landmark} />
          <KpiCard label="TIR proyectada" value={`${metrics.averageIrr.toFixed(1)}%`} icon={Percent} />
          <KpiCard label="Total distribuido" value={compactMoney.format(metrics.totalDistributed)} icon={WalletCards} trend={trend} trendLabel="vs mes anterior" />
          <KpiCard label="Inversionistas activos" value={String(data.investors.length)} icon={Users} />
        </div>

        <article className="panel p-4">
          <div className="flex items-start justify-between">
            <div><p className="text-[11px] font-semibold">Actividad del portafolio</p><p className="mt-1 text-[9px] text-[#6b7594]">Presupuesto por proyecto activo</p></div>
            <span className="rounded-md border border-[#2a3554] bg-[#161d33] px-2 py-1 text-[8px] text-[#8a93b2]">Datos en vivo</span>
          </div>
          <div className="mt-2">{data.projects.length ? <PortfolioActivityDonut items={data.projects.map((project) => ({ label: project.name, amount: project.budgetTotal }))} /> : <div className="grid h-[176px] place-items-center text-[10px] text-[#6b7594]">Agrega un proyecto para ver la distribución del presupuesto.</div>}</div>
        </article>
      </section>

      <section className="mt-3 grid gap-3 xl:grid-cols-[1.45fr_1fr]">
        <article className="panel p-4">
          <div className="flex items-start justify-between"><div><p className="text-[11px] font-semibold">Actividad de distribuciones</p><p className="mt-1 text-[9px] text-[#6b7594]">Pagos por mes y acumulado del portafolio</p></div><span className="rounded-md bg-[#151c31] px-2 py-1 text-[8px] text-[#7c86a6]">Últimos 12 meses</span></div>
          <div className="mt-4 h-[225px]">{monthlySeries.length ? <DistributionLineChart values={monthlySeries.map((item) => item.amount)} labels={monthlySeries.map((item) => item.label)} cumulative={monthlySeries.map((item) => item.cumulative)} /> : <div className="grid h-full place-items-center text-[10px] text-[#6b7594]">Todavía no hay distribuciones.</div>}</div>
        </article>

        <article className="panel p-4">
          <div className="flex items-start justify-between"><div><p className="text-[11px] font-semibold">Estado de proyectos</p><p className="mt-1 text-[9px] text-[#6b7594]">Avance de obra y ocupación</p></div><Building2 size={14} className="text-[#7c86a6]" /></div>
          <div className="mt-4 space-y-4">
            {data.projects.map((project) => (
              <div key={project.id}>
                <div className="mb-2 flex items-center justify-between gap-3"><div className="min-w-0"><p className="truncate text-[9px] font-medium">{project.name}</p><p className="mt-0.5 text-[8px] text-[#596382]">{project.location}</p></div><StatusBadge status={project.status} /></div>
                <div className="flex items-center gap-3"><div className="flex-1"><ProgressBar value={project.constructionPct} color={project.status === "delayed" ? "#ff5470" : "#4d7cfe"} /></div><span className="tabular w-8 text-right text-[8px] text-[#8a93b2]">{project.constructionPct}%</span></div>
              </div>
            ))}
            {data.projects.length === 0 ? <div className="grid h-[180px] place-items-center text-center text-[10px] text-[#6b7594]">Todavía no hay proyectos.</div> : null}
          </div>
        </article>
      </section>

      <section className="mt-3 grid gap-3 xl:grid-cols-[1fr_1.6fr]">
        {data.projects.length >= 2 ? (
          <article className="panel p-4">
            <p className="text-[11px] font-semibold">Comparativa de proyectos</p><p className="mt-1 text-[9px] text-[#6b7594]">Avance, ocupación y TIR proyectada</p>
            <div className="mt-3 h-[290px]"><ProjectRadarChart projects={data.projects.map((project) => ({ label: project.name, construction: project.constructionPct, occupancy: project.occupancyPct, irr: project.projectedIrr }))} /></div>
          </article>
        ) : null}
        <article className={`panel overflow-hidden ${data.projects.length >= 2 ? "" : "xl:col-span-2"}`}>
        <div className="flex items-center justify-between border-b border-[#232b45] px-4 py-3"><div><p className="text-[11px] font-semibold">Distribuciones recientes</p><p className="mt-1 text-[8px] text-[#596382]">Pagos más recientes registrados</p></div><span className="rounded-md bg-[#182038] px-2 py-1 text-[8px] text-[#8a93b2]">{data.distributions.length} en total</span></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[740px] border-collapse text-left">
            <thead><tr className="border-b border-[#232b45] text-[8px] uppercase tracking-[.1em] text-[#596382]"><th className="px-4 py-3 font-semibold">Referencia</th><th className="px-3 py-3 font-semibold">Proyecto</th><th className="px-3 py-3 font-semibold">Inversionista</th><th className="px-3 py-3 font-semibold">Fecha</th><th className="px-4 py-3 text-right font-semibold">Monto</th></tr></thead>
            <tbody>
              {recentDistributions.map((distribution) => (
                <tr key={distribution.id} className="table-row border-b border-[#192138] last:border-0">
                  <td className="px-4 py-3 text-[9px] font-medium text-[#7ea2ff]">{distribution.id.toUpperCase()}</td>
                  <td className="px-3 py-3 text-[9px]">{projectById.get(distribution.projectId)?.name ?? distribution.projectId}</td>
                  <td className="px-3 py-3 text-[9px] text-[#8a93b2]">{investorById.get(distribution.investorId)?.name ?? distribution.investorId}</td>
                  <td className="px-3 py-3 text-[9px] text-[#7c86a6]">{dateFormatter.format(new Date(`${distribution.date}T12:00:00`))}</td>
                  <td className="tabular px-4 py-3 text-right text-[9px] font-semibold text-[#d5dcee]">{money.format(distribution.amount)}</td>
                </tr>
              ))}
              {recentDistributions.length === 0 ? <tr><td colSpan={5} className="px-4 py-10 text-center text-[10px] text-[#6b7594]">Todavía no hay distribuciones registradas.</td></tr> : null}
            </tbody>
          </table>
        </div>
        </article>
      </section>

      <section className="mt-6">
        <div className="mb-3 flex items-end justify-between"><div><p className="text-[12px] font-semibold">Portafolio de proyectos</p><p className="mt-1 text-[9px] text-[#6b7594]">{data.projects.length} proyectos · abre uno para ver todos sus detalles</p></div></div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{data.projects.map((project) => <ProjectCard key={project.id} project={project} data={data} />)}</div>
      </section>

      <ProjectCreateForm />
      <ExcelImportForm />
    </>
  );
}
