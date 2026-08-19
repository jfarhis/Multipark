import { ArrowUpRight, Building2, CircleDollarSign, Download, Landmark, Percent, WalletCards } from "lucide-react";
import { dashboardRepository } from "@/lib/data/repository";
import { compactMoney, portfolioMetrics } from "@/lib/calculations";
import { KpiCard } from "@/components/kpi-card";
import { PageHeading } from "@/components/page-heading";
import { DistributionLineChart, OccupancyBarChart } from "@/components/charts";
import { ProjectCard } from "@/components/project-card";

export default async function AdminOverviewPage() {
  const data = await dashboardRepository.getDashboardData();
  const metrics = portfolioMetrics(data);
  return (
    <>
      <PageHeading eyebrow="Portfolio command center" title="Portfolio overview" description="Monitor capital deployment, operating performance, and construction progress across every active position." action={<button className="secondary-button px-3.5"><Download size={14} />Export report</button>} />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total invested" value={compactMoney.format(metrics.totalInvested)} trend={12.4} icon={Landmark} emphasized />
        <KpiCard label="Average projected IRR" value={`${metrics.averageIrr.toFixed(1)}%`} trend={2.1} icon={Percent} />
        <KpiCard label="Blended occupancy" value={`${metrics.blendedOccupancy.toFixed(0)}%`} trend={6.8} icon={Building2} />
        <KpiCard label="Total distributed" value={compactMoney.format(metrics.totalDistributed)} trend={9.6} icon={WalletCards} />
      </section>
      <section className="mt-4 grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <article className="panel p-5"><div className="flex items-start justify-between"><div><p className="text-[13px] font-semibold">Distributions over time</p><p className="mt-1 text-[10px] text-[#8181a3]">Trailing seven-month portfolio performance</p></div><span className="rounded-lg bg-[#20204a] px-2.5 py-1.5 text-[9px] text-[#9a9ab8]">Monthly</span></div><div className="mt-5 h-[240px]"><DistributionLineChart /></div></article>
        <article className="panel p-5"><div className="flex items-start justify-between"><div><p className="text-[13px] font-semibold">Occupancy by project</p><p className="mt-1 text-[10px] text-[#8181a3]">Current leased inventory</p></div><ArrowUpRight size={15} className="text-[#77779a]" /></div><div className="mt-5 h-[240px]"><OccupancyBarChart values={data.projects.map((project) => project.occupancyPct)} /></div></article>
      </section>
      <section className="mt-7"><div className="mb-4 flex items-center justify-between"><div><p className="text-[14px] font-semibold">Project portfolio</p><p className="mt-1 text-[10px] text-[#7f7fa1]">{data.projects.length} projects · live operating summary</p></div><button className="primary-button px-3.5"><CircleDollarSign size={14} />New investment</button></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{data.projects.map((project) => <ProjectCard key={project.id} project={project} data={data} />)}</div></section>
    </>
  );
}
