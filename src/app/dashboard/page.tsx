import { BriefcaseBusiness, CircleDollarSign, Percent, WalletCards } from "lucide-react";
import { getSession } from "@/lib/auth";
import { dashboardRepository } from "@/lib/data/repository";
import { compactMoney, investorPortfolio } from "@/lib/calculations";
import { KpiCard } from "@/components/kpi-card";
import { PageHeading } from "@/components/page-heading";
import { ProjectCard } from "@/components/project-card";
import { DistributionLineChart } from "@/components/charts";

export default async function InvestorDashboardPage() {
  const [session, data] = await Promise.all([getSession(), dashboardRepository.getDashboardData()]);
  const portfolio = investorPortfolio(data, session?.investorId ?? "inv-001");
  const positions = portfolio.stakes.map((stake) => ({ stake, project: data.projects.find((project) => project.id === stake.projectId)! }));
  return (
    <>
      <PageHeading eyebrow="Personal portfolio" title={`Welcome back, ${session?.name.split(" ")[0] ?? "Investor"}`} description="Your private view of invested capital, project progress, and distributions." />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total invested" value={compactMoney.format(portfolio.totalInvested)} trend={8.7} icon={CircleDollarSign} emphasized />
        <KpiCard label="Total distributed" value={compactMoney.format(portfolio.totalDistributed)} trend={11.4} icon={WalletCards} />
        <KpiCard label="Blended projected IRR" value={`${portfolio.blendedIrr.toFixed(1)}%`} trend={1.8} icon={Percent} />
        <KpiCard label="Active positions" value={String(positions.filter(({ project }) => project.status !== "complete").length)} trend={0} icon={BriefcaseBusiness} />
      </section>
      <section className="mt-4 grid gap-4 xl:grid-cols-[1.45fr_1fr]">
        <article className="panel p-5"><p className="text-[13px] font-semibold">Your distributions</p><p className="mt-1 text-[10px] text-[#8181a3]">Payments received across every position</p><div className="mt-5 h-[235px]"><DistributionLineChart values={[38, 52, 47, 69, 78, 91, 108]} /></div></article>
        <article className="panel flex flex-col justify-between overflow-hidden p-5"><div><p className="eyebrow">Next expected distribution</p><p className="tabular mt-4 text-[32px] font-semibold tracking-[-0.04em]">$94,800</p><p className="mt-1 text-[11px] text-[#8b8bab]">Estimated for September 15, 2026</p></div><div className="mt-8 rounded-xl bg-[#20204a] p-4"><div className="flex items-center justify-between text-[10px]"><span className="text-[#9090b0]">Projected annual cash yield</span><span className="font-semibold text-[#4fe8b8]">8.4%</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#11112b]"><div className="h-full w-[84%] rounded-full bg-[linear-gradient(90deg,#6c5ce7,#00cec9)]" /></div></div></article>
      </section>
      <section className="mt-7"><div className="mb-4"><p className="text-[14px] font-semibold">Your positions</p><p className="mt-1 text-[10px] text-[#7f7fa1]">Performance is calculated from your ownership percentage in each project.</p></div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{positions.map(({ project, stake }) => <ProjectCard key={project.id} project={project} data={data} stake={stake} />)}</div></section>
    </>
  );
}
