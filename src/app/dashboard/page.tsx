import { BriefcaseBusiness, CircleDollarSign, Percent, WalletCards } from "lucide-react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getDashboardData } from "@/lib/data/repository";
import { compactMoney, distributionTrend, investorPortfolio, monthlyDistributionSeries } from "@/lib/calculations";
import { KpiCard } from "@/components/kpi-card";
import { PageHeading } from "@/components/page-heading";
import { ProjectCard } from "@/components/project-card";
import { DistributionLineChart, ProjectRadarChart } from "@/components/charts";

export default async function InvestorDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const data = await getDashboardData(session);
  const portfolio = investorPortfolio(data, session.investorId ?? "");
  const positions = portfolio.stakes.flatMap((stake) => {
    const project = data.projects.find((item) => item.id === stake.projectId);
    return project ? [{ stake, project }] : [];
  });
  const distributions = data.distributions.filter((item) => item.investorId === session.investorId).toSorted((a, b) => a.date.localeCompare(b.date));
  const latestDistribution = distributions.at(-1);
  const monthlySeries = monthlyDistributionSeries(distributions).slice(-12);
  const trend = distributionTrend(monthlySeries);
  const returnedPct = portfolio.totalInvested ? Math.min(100, (portfolio.totalDistributed / portfolio.totalInvested) * 100) : 0;
  return (
    <>
      <PageHeading eyebrow="Portafolio personal" title={`Bienvenido, ${session.name.split(" ")[0]}`} description="Tu vista privada del capital invertido en MXN, avance de las naves y pagos recibidos." />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total invertido" value={compactMoney.format(portfolio.totalInvested)} icon={CircleDollarSign} emphasized />
        <KpiCard label="Total distribuido" value={compactMoney.format(portfolio.totalDistributed)} icon={WalletCards} trend={trend} trendLabel="vs mes anterior" />
        <KpiCard label="TIR proyectada combinada" value={`${portfolio.blendedIrr.toFixed(1)}%`} icon={Percent} />
        <KpiCard label="Participaciones activas" value={String(positions.filter(({ project }) => project.status !== "complete").length)} icon={BriefcaseBusiness} />
      </section>
      <section className="mt-4 grid gap-4 xl:grid-cols-[1.45fr_1fr]">
        <article className="panel p-5"><p className="text-[13px] font-semibold">Tus pagos recibidos</p><p className="mt-1 text-[13px] text-[#6b7594]">Pagos por mes y acumulado de todas tus inversiones</p><div className="mt-5 h-[235px]">{monthlySeries.length ? <DistributionLineChart values={monthlySeries.map((item) => item.amount)} labels={monthlySeries.map((item) => item.label)} cumulative={monthlySeries.map((item) => item.cumulative)} /> : <div className="grid h-full place-items-center text-[13px] text-[#6b7594]">Todavía no hay pagos registrados.</div>}</div></article>
        <article className="panel flex flex-col justify-between overflow-hidden p-5"><div><p className="eyebrow">Último pago</p><p className="tabular mt-4 text-[32px] font-semibold tracking-[-0.04em]">{compactMoney.format(latestDistribution?.amount ?? 0)}</p><p className="mt-1 text-[14px] text-[#7c86a6]">{latestDistribution ? `Registrado el ${latestDistribution.date}` : "Todavía no hay pagos"}</p></div><div className="mt-8 rounded-xl bg-[#161d33] p-4"><div className="flex items-center justify-between text-[13px]"><span className="text-[#8a93b2]">Capital devuelto a la fecha</span><span className="font-semibold text-[#2dd4a7]">{returnedPct.toFixed(1)}%</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#0b101e]"><div className="h-full rounded-full bg-[linear-gradient(90deg,#5b8cff,#2dd4a7)]" style={{ width: `${returnedPct}%` }} /></div></div></article>
      </section>
      {positions.length >= 2 ? (
        <section className="mt-4 grid gap-4 xl:grid-cols-2">
          <article className="panel p-5"><p className="text-[13px] font-semibold">Comparativa de tus proyectos</p><p className="mt-1 text-[13px] text-[#6b7594]">Avance, ocupación y TIR proyectada lado a lado</p><div className="mt-4 h-[280px]"><ProjectRadarChart projects={positions.map(({ project }) => ({ label: project.name, construction: project.constructionPct, occupancy: project.occupancyPct, irr: project.projectedIrr }))} /></div></article>
          <article className="panel overflow-hidden"><div className="border-b border-[#1b2340] p-5"><p className="text-[13px] font-semibold">Resumen por proyecto</p><p className="mt-1 text-[13px] text-[#6b7594]">Tu posición en cada proyecto</p></div><div className="divide-y divide-[#1b2340]">{positions.map(({ project, stake }) => <div key={project.id} className="table-row flex items-center justify-between gap-3 px-5 py-3.5"><div className="min-w-0"><p className="truncate text-[14px] font-medium">{project.name}</p><p className="mt-1 text-[12px] text-[#596382]">Participación {stake.stakePct}%</p></div><p className="tabular shrink-0 text-[14px] font-semibold text-[#7ea2ff]">{compactMoney.format(stake.capitalCommitted)}</p></div>)}</div></article>
        </section>
      ) : null}
      <section className="mt-7"><div className="mb-4"><p className="text-[14px] font-semibold">Tus participaciones</p><p className="mt-1 text-[13px] text-[#7c86a6]">El rendimiento se calcula con tu porcentaje en cada proyecto.</p></div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{positions.map(({ project, stake }) => <ProjectCard key={project.id} project={project} data={data} stake={stake} />)}</div>{positions.length === 0 ? <div className="panel p-10 text-center text-[13px] text-[#7c86a6]">Todavía no tienes participaciones asignadas.</div> : null}</section>
    </>
  );
}
