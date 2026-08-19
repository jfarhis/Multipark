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
  const portfolio = investorPortfolio(data, session?.investorId ?? "");
  const positions = portfolio.stakes.map((stake) => ({ stake, project: data.projects.find((project) => project.id === stake.projectId)! }));
  const distributions = data.distributions.filter((item) => item.investorId === session?.investorId).toSorted((a, b) => a.date.localeCompare(b.date));
  const latestDistribution = distributions.at(-1);
  const recentDistributions = distributions.slice(-7);
  const distributionValues = recentDistributions.map((item) => Math.round(item.amount / 1000));
  const distributionLabels = recentDistributions.map((item) => new Intl.DateTimeFormat("es-MX", { month: "short", day: "numeric" }).format(new Date(`${item.date}T12:00:00`)));
  const returnedPct = portfolio.totalInvested ? Math.min(100, (portfolio.totalDistributed / portfolio.totalInvested) * 100) : 0;
  return (
    <>
      <PageHeading eyebrow="Portafolio personal" title={`Bienvenido, ${session?.name.split(" ")[0] ?? "Inversionista"}`} description="Tu vista privada del capital invertido, avance de proyectos y distribuciones." />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total invertido" value={compactMoney.format(portfolio.totalInvested)} icon={CircleDollarSign} emphasized />
        <KpiCard label="Total distribuido" value={compactMoney.format(portfolio.totalDistributed)} icon={WalletCards} />
        <KpiCard label="TIR proyectada combinada" value={`${portfolio.blendedIrr.toFixed(1)}%`} icon={Percent} />
        <KpiCard label="Participaciones activas" value={String(positions.filter(({ project }) => project.status !== "complete").length)} icon={BriefcaseBusiness} />
      </section>
      <section className="mt-4 grid gap-4 xl:grid-cols-[1.45fr_1fr]">
        <article className="panel p-5"><p className="text-[13px] font-semibold">Tus distribuciones</p><p className="mt-1 text-[10px] text-[#718078]">Pagos más recientes de todas tus participaciones</p><div className="mt-5 h-[235px]">{distributionValues.length ? <DistributionLineChart values={distributionValues} labels={distributionLabels} /> : <div className="grid h-full place-items-center text-[10px] text-[#718078]">Todavía no hay distribuciones.</div>}</div></article>
        <article className="panel flex flex-col justify-between overflow-hidden p-5"><div><p className="eyebrow">Última distribución</p><p className="tabular mt-4 text-[32px] font-semibold tracking-[-0.04em]">{compactMoney.format(latestDistribution?.amount ?? 0)}</p><p className="mt-1 text-[11px] text-[#7d8a82]">{latestDistribution ? `Registrada el ${latestDistribution.date}` : "Todavía no hay distribuciones"}</p></div><div className="mt-8 rounded-xl bg-[#141d18] p-4"><div className="flex items-center justify-between text-[10px]"><span className="text-[#859188]">Capital devuelto a la fecha</span><span className="font-semibold text-[#35d99a]">{returnedPct.toFixed(1)}%</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#0a0f0c]"><div className="h-full rounded-full bg-[linear-gradient(90deg,#8b72ff,#22c9a5)]" style={{ width: `${returnedPct}%` }} /></div></div></article>
      </section>
      <section className="mt-7"><div className="mb-4"><p className="text-[14px] font-semibold">Tus participaciones</p><p className="mt-1 text-[10px] text-[#7f7fa1]">El rendimiento se calcula con tu porcentaje en cada proyecto.</p></div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{positions.map(({ project, stake }) => <ProjectCard key={project.id} project={project} data={data} stake={stake} />)}</div>{positions.length === 0 ? <div className="panel p-10 text-center text-[10px] text-[#7f7fa1]">Todavía no tienes participaciones asignadas.</div> : null}</section>
    </>
  );
}
