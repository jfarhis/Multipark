import { Building2, Landmark, Percent, Users, WalletCards } from "lucide-react";
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

const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

export default async function AdminOverviewPage() {
  const data = await dashboardRepository.getDashboardData();
  const metrics = portfolioMetrics(data);
  const projectById = new Map(data.projects.map((project) => [project.id, project]));
  const investorById = new Map(data.investors.map((investor) => [investor.id, investor]));
  const recentDistributions = data.distributions.toSorted((a, b) => b.date.localeCompare(a.date)).slice(0, 7);
  const chartDistributions = data.distributions.toSorted((a, b) => a.date.localeCompare(b.date)).slice(-7);
  const chartValues = chartDistributions.map((item) => Math.round(item.amount / 1000));
  const chartLabels = chartDistributions.map((item) => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(`${item.date}T12:00:00`)));
  const exportRows = data.distributions.map((distribution) => ({
    Date: distribution.date,
    Project: projectById.get(distribution.projectId)?.name ?? distribution.projectId,
    Investor: investorById.get(distribution.investorId)?.name ?? distribution.investorId,
    Amount: distribution.amount,
  }));

  return (
    <>
      <PageHeading
        eyebrow="Portfolio command center"
        title="Good evening, Joseph"
        description="Live capital, project, and investor performance across the Gasfar portfolio."
        action={<ExportButton filename="gasfar-portfolio-distributions.csv" rows={exportRows} label="Export report" />}
      />

      <section className="grid gap-3 xl:grid-cols-[1.05fr_1fr]">
        <div className="grid gap-3 sm:grid-cols-2">
          <KpiCard label="Capital invested" value={compactMoney.format(metrics.totalInvested)} icon={Landmark} />
          <KpiCard label="Projected IRR" value={`${metrics.averageIrr.toFixed(1)}%`} icon={Percent} />
          <KpiCard label="Total distributed" value={compactMoney.format(metrics.totalDistributed)} icon={WalletCards} />
          <KpiCard label="Active investors" value={String(data.investors.length)} icon={Users} />
        </div>

        <article className="panel p-4">
          <div className="flex items-start justify-between">
            <div><p className="text-[11px] font-semibold">Portfolio activity</p><p className="mt-1 text-[9px] text-[#6d7a72]">Budget allocation by active project</p></div>
            <span className="rounded-md border border-[#26332c] bg-[#141d18] px-2 py-1 text-[8px] text-[#829088]">Live data</span>
          </div>
          <div className="mt-2"><PortfolioActivityDonut items={data.projects.map((project) => ({ label: project.name, amount: project.budgetTotal }))} /></div>
        </article>
      </section>

      <section className="mt-3 grid gap-3 xl:grid-cols-[1.45fr_1fr]">
        <article className="panel p-4">
          <div className="flex items-start justify-between"><div><p className="text-[11px] font-semibold">Distribution activity</p><p className="mt-1 text-[9px] text-[#6d7a72]">Recent portfolio payments, grouped for comparison</p></div><span className="rounded-md bg-[#151f19] px-2 py-1 text-[8px] text-[#758279]">Last 7 periods</span></div>
          <div className="mt-4 h-[225px]"><DistributionLineChart values={chartValues} labels={chartLabels} /></div>
        </article>

        <article className="panel p-4">
          <div className="flex items-start justify-between"><div><p className="text-[11px] font-semibold">Project health</p><p className="mt-1 text-[9px] text-[#6d7a72]">Construction and current occupancy</p></div><Building2 size={14} className="text-[#78867e]" /></div>
          <div className="mt-4 space-y-4">
            {data.projects.map((project) => (
              <div key={project.id}>
                <div className="mb-2 flex items-center justify-between gap-3"><div className="min-w-0"><p className="truncate text-[9px] font-medium">{project.name}</p><p className="mt-0.5 text-[8px] text-[#657269]">{project.location}</p></div><StatusBadge status={project.status} /></div>
                <div className="flex items-center gap-3"><div className="flex-1"><ProgressBar value={project.constructionPct} color={project.status === "delayed" ? "#ff5470" : "#8b72ff"} /></div><span className="tabular w-8 text-right text-[8px] text-[#87948c]">{project.constructionPct}%</span></div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="panel mt-3 overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#202b25] px-4 py-3"><div><p className="text-[11px] font-semibold">Recent distributions</p><p className="mt-1 text-[8px] text-[#657269]">Newest investor payments recorded in the database</p></div><span className="rounded-md bg-[#1a211e] px-2 py-1 text-[8px] text-[#8a968e]">{data.distributions.length} total</span></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[740px] border-collapse text-left">
            <thead><tr className="border-b border-[#202b25] text-[8px] uppercase tracking-[.1em] text-[#5f6c64]"><th className="px-4 py-3 font-semibold">Reference</th><th className="px-3 py-3 font-semibold">Project</th><th className="px-3 py-3 font-semibold">Investor</th><th className="px-3 py-3 font-semibold">Date</th><th className="px-4 py-3 text-right font-semibold">Amount</th></tr></thead>
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
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-3 flex items-end justify-between"><div><p className="text-[12px] font-semibold">Project portfolio</p><p className="mt-1 text-[9px] text-[#67746c]">{data.projects.length} projects · click any project for full details</p></div></div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{data.projects.map((project) => <ProjectCard key={project.id} project={project} data={data} />)}</div>
      </section>

      <ProjectCreateForm />
      <ExcelImportForm />
    </>
  );
}
