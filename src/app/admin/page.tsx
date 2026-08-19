import Link from "next/link";
import { Building2, FolderPlus, Landmark, Percent, UserPlus, Users, WalletCards } from "lucide-react";
import { DistributionLineChart, PortfolioActivityDonut } from "@/components/charts";
import { ExportButton } from "@/components/export-button";
import { ExcelImportForm } from "@/components/excel-import-form";
import { KpiCard } from "@/components/kpi-card";
import { PageHeading } from "@/components/page-heading";
import { ProgressBar } from "@/components/progress-bar";
import { ProjectCard } from "@/components/project-card";
import { ProjectCreateForm } from "@/components/project-create-form";
import { StatusBadge } from "@/components/status-badge";
import { compactMoney, money, portfolioMetrics } from "@/lib/calculations";
import { dashboardRepository } from "@/lib/data/repository";

const dateFormatter = new Intl.DateTimeFormat("es-MX", { month: "short", day: "numeric", year: "numeric" });

export default async function AdminOverviewPage() {
  const data = await dashboardRepository.getDashboardData();
  const metrics = portfolioMetrics(data);
  const projectById = new Map(data.projects.map((project) => [project.id, project]));
  const investorById = new Map(data.investors.map((investor) => [investor.id, investor]));
  const recentDistributions = data.distributions.toSorted((a, b) => b.date.localeCompare(a.date)).slice(0, 7);
  const chartDistributions = data.distributions.toSorted((a, b) => a.date.localeCompare(b.date)).slice(-7);
  const chartValues = chartDistributions.map((item) => Math.round(item.amount / 1000));
  const chartLabels = chartDistributions.map((item) => new Intl.DateTimeFormat("es-MX", { month: "short", day: "numeric" }).format(new Date(`${item.date}T12:00:00`)));
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
        title="Bienvenido, Joseph"
        description="Capital, proyectos e inversionistas del portafolio Gasfar en un solo lugar."
        action={<ExportButton filename="gasfar-distribuciones.csv" rows={exportRows} label="Exportar reporte" />}
      />

      {data.projects.length === 0 && data.investors.length === 0 ? (
        <section className="panel mb-4 p-6 sm:p-8">
          <p className="eyebrow">Tu espacio está listo</p>
          <h2 className="mt-3 text-[18px] font-semibold">Empieza con tu primer proyecto</h2>
          <p className="mt-2 max-w-2xl text-[11px] leading-5 text-[#7d8a82]">El panel está completamente vacío. Crea un proyecto y después agrega inversionistas, participaciones, distribuciones y documentos.</p>
          <div className="mt-5 flex flex-wrap gap-3"><a href="#new-project" className="primary-button px-4"><FolderPlus size={14} />Crear primer proyecto</a><Link href="/admin/investors#invite-investor" className="secondary-button px-4"><UserPlus size={14} />Agregar inversionista</Link></div>
        </section>
      ) : null}

      <section className="grid gap-3 xl:grid-cols-[1.05fr_1fr]">
        <div className="grid gap-3 sm:grid-cols-2">
          <KpiCard label="Capital invertido" value={compactMoney.format(metrics.totalInvested)} icon={Landmark} />
          <KpiCard label="TIR proyectada" value={`${metrics.averageIrr.toFixed(1)}%`} icon={Percent} />
          <KpiCard label="Total distribuido" value={compactMoney.format(metrics.totalDistributed)} icon={WalletCards} />
          <KpiCard label="Inversionistas activos" value={String(data.investors.length)} icon={Users} />
        </div>

        <article className="panel p-4">
          <div className="flex items-start justify-between">
            <div><p className="text-[11px] font-semibold">Actividad del portafolio</p><p className="mt-1 text-[9px] text-[#6d7a72]">Presupuesto por proyecto activo</p></div>
            <span className="rounded-md border border-[#26332c] bg-[#141d18] px-2 py-1 text-[8px] text-[#829088]">Datos en vivo</span>
          </div>
          <div className="mt-2">{data.projects.length ? <PortfolioActivityDonut items={data.projects.map((project) => ({ label: project.name, amount: project.budgetTotal }))} /> : <div className="grid h-[176px] place-items-center text-[10px] text-[#718078]">Agrega un proyecto para ver la distribución del presupuesto.</div>}</div>
        </article>
      </section>

      <section className="mt-3 grid gap-3 xl:grid-cols-[1.45fr_1fr]">
        <article className="panel p-4">
          <div className="flex items-start justify-between"><div><p className="text-[11px] font-semibold">Actividad de distribuciones</p><p className="mt-1 text-[9px] text-[#6d7a72]">Pagos recientes del portafolio</p></div><span className="rounded-md bg-[#151f19] px-2 py-1 text-[8px] text-[#758279]">Últimos 7 periodos</span></div>
          <div className="mt-4 h-[225px]">{chartValues.length ? <DistributionLineChart values={chartValues} labels={chartLabels} /> : <div className="grid h-full place-items-center text-[10px] text-[#718078]">Todavía no hay distribuciones.</div>}</div>
        </article>

        <article className="panel p-4">
          <div className="flex items-start justify-between"><div><p className="text-[11px] font-semibold">Estado de proyectos</p><p className="mt-1 text-[9px] text-[#6d7a72]">Avance de obra y ocupación</p></div><Building2 size={14} className="text-[#78867e]" /></div>
          <div className="mt-4 space-y-4">
            {data.projects.map((project) => (
              <div key={project.id}>
                <div className="mb-2 flex items-center justify-between gap-3"><div className="min-w-0"><p className="truncate text-[9px] font-medium">{project.name}</p><p className="mt-0.5 text-[8px] text-[#657269]">{project.location}</p></div><StatusBadge status={project.status} /></div>
                <div className="flex items-center gap-3"><div className="flex-1"><ProgressBar value={project.constructionPct} color={project.status === "delayed" ? "#ff5470" : "#8b72ff"} /></div><span className="tabular w-8 text-right text-[8px] text-[#87948c]">{project.constructionPct}%</span></div>
              </div>
            ))}
            {data.projects.length === 0 ? <div className="grid h-[180px] place-items-center text-center text-[10px] text-[#718078]">Todavía no hay proyectos.</div> : null}
          </div>
        </article>
      </section>

      <section className="panel mt-3 overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#202b25] px-4 py-3"><div><p className="text-[11px] font-semibold">Distribuciones recientes</p><p className="mt-1 text-[8px] text-[#657269]">Pagos más recientes registrados</p></div><span className="rounded-md bg-[#1a211e] px-2 py-1 text-[8px] text-[#8a968e]">{data.distributions.length} en total</span></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[740px] border-collapse text-left">
            <thead><tr className="border-b border-[#202b25] text-[8px] uppercase tracking-[.1em] text-[#5f6c64]"><th className="px-4 py-3 font-semibold">Referencia</th><th className="px-3 py-3 font-semibold">Proyecto</th><th className="px-3 py-3 font-semibold">Inversionista</th><th className="px-3 py-3 font-semibold">Fecha</th><th className="px-4 py-3 text-right font-semibold">Monto</th></tr></thead>
            <tbody>
              {recentDistributions.map((distribution) => (
                <tr key={distribution.id} className="table-row border-b border-[#1b2520] last:border-0">
                  <td className="px-4 py-3 text-[9px] font-medium text-[#9f8cff]">{distribution.id.toUpperCase()}</td>
                  <td className="px-3 py-3 text-[9px]">{projectById.get(distribution.projectId)?.name ?? distribution.projectId}</td>
                  <td className="px-3 py-3 text-[9px] text-[#8c9991]">{investorById.get(distribution.investorId)?.name ?? distribution.investorId}</td>
                  <td className="px-3 py-3 text-[9px] text-[#748078]">{dateFormatter.format(new Date(`${distribution.date}T12:00:00`))}</td>
                  <td className="tabular px-4 py-3 text-right text-[9px] font-semibold text-[#dfe6e1]">{money.format(distribution.amount)}</td>
                </tr>
              ))}
              {recentDistributions.length === 0 ? <tr><td colSpan={5} className="px-4 py-10 text-center text-[10px] text-[#718078]">Todavía no hay distribuciones registradas.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-3 flex items-end justify-between"><div><p className="text-[12px] font-semibold">Portafolio de proyectos</p><p className="mt-1 text-[9px] text-[#67746c]">{data.projects.length} proyectos · abre uno para ver todos sus detalles</p></div></div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{data.projects.map((project) => <ProjectCard key={project.id} project={project} data={data} />)}</div>
      </section>

      <ProjectCreateForm />
      <ExcelImportForm />
    </>
  );
}
