import { ArrowLeft, Building2, Landmark, WalletCards } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/auth";
import { getDashboardData } from "@/lib/data/repository";
import { investorPortfolio, money } from "@/lib/calculations";
import { InvestorEditor } from "@/components/investor-editor";
import { InvestorProfileForm } from "@/components/investor-profile-form";
import { KpiCard } from "@/components/kpi-card";

export default async function InvestorDetailPage({ params }: PageProps<"/admin/investors/[investorId]">) {
  const [{ investorId }, session] = await Promise.all([params, requireAdminSession()]);
  const data = await getDashboardData(session);
  const investor = data.investors.find((item) => item.id === investorId); if (!investor) notFound();
  const portfolio = investorPortfolio(data, investor.id);
  const history = data.distributions.filter((item) => item.investorId === investor.id).sort((a, b) => b.date.localeCompare(a.date));
  return <><Link href="/admin/investors" className="mb-5 inline-flex items-center gap-1.5 text-[10px] text-[#84908a]"><ArrowLeft size={12} />Volver a inversionistas</Link><div className="mb-6 flex items-center gap-4"><span className="grid size-12 place-items-center rounded-2xl bg-[linear-gradient(135deg,#6c5ce7,#00cec9)] text-[12px] font-bold">{investor.name.split(" ").map((word) => word[0]).join("")}</span><div><h1 className="text-[22px] font-medium">{investor.name}</h1><p className="mt-1 text-[10px] text-[#7d8a82]">{investor.email} · Referencia bancaria: {investor.bankDetails}</p></div></div><InvestorProfileForm investor={investor} /><section className="mb-4 grid gap-3 sm:grid-cols-3"><KpiCard label="Total invertido" value={money.format(portfolio.totalInvested)} icon={Landmark} /><KpiCard label="Total distribuido" value={money.format(portfolio.totalDistributed)} icon={WalletCards} /><KpiCard label="Participaciones" value={String(portfolio.stakes.length)} icon={Building2} /></section><div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]"><InvestorEditor investor={investor} data={data} /><section className="panel overflow-hidden"><div className="border-b border-[#202b25] p-5"><p className="text-[13px] font-semibold">Historial de pagos</p><p className="mt-1 text-[10px] text-[#7d8a82]">Todas las distribuciones recibidas</p></div><div className="max-h-[420px] divide-y divide-[#202b25]/70 overflow-auto">{history.map((item) => <div key={item.id} className="table-row flex items-center justify-between gap-3 px-5 py-3.5"><div><p className="text-[10px] font-medium">{data.projects.find((project) => project.id === item.projectId)?.name}</p><p className="mt-1 text-[9px] text-[#5f6c64]">{item.date}</p></div><p className="tabular text-[11px] font-semibold text-[#4fe8b8]">{money.format(item.amount)}</p></div>)}{history.length === 0 ? <div className="p-10 text-center text-[10px] text-[#7d8a82]">Todavía no hay pagos.</div> : null}</div></section></div></>;
}
