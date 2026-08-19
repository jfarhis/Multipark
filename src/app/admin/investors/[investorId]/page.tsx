import { ArrowLeft, Building2, Landmark, WalletCards } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { dashboardRepository } from "@/lib/data/repository";
import { investorPortfolio, money } from "@/lib/calculations";
import { InvestorEditor } from "@/components/investor-editor";
import { KpiCard } from "@/components/kpi-card";

export default async function InvestorDetailPage({ params }: PageProps<"/admin/investors/[investorId]">) {
  const [{ investorId }, data] = await Promise.all([params, dashboardRepository.getDashboardData()]);
  const investor = data.investors.find((item) => item.id === investorId); if (!investor) notFound();
  const portfolio = investorPortfolio(data, investor.id);
  const history = data.distributions.filter((item) => item.investorId === investor.id).sort((a, b) => b.date.localeCompare(a.date));
  return <><Link href="/admin/investors" className="mb-5 inline-flex items-center gap-1.5 text-[10px] text-[#8585a7]"><ArrowLeft size={12} />Back to investors</Link><div className="mb-6 flex items-center gap-4"><span className="grid size-12 place-items-center rounded-2xl bg-[linear-gradient(135deg,#6c5ce7,#00cec9)] text-[12px] font-bold">{investor.name.split(" ").map((word) => word[0]).join("")}</span><div><h1 className="text-[22px] font-medium">{investor.name}</h1><p className="mt-1 text-[10px] text-[#8181a3]">{investor.email} · Bank {investor.bankDetails}</p></div></div><section className="mb-4 grid gap-3 sm:grid-cols-3"><KpiCard label="Total invested" value={money.format(portfolio.totalInvested)} trend={8.4} icon={Landmark} /><KpiCard label="Total distributed" value={money.format(portfolio.totalDistributed)} trend={11.2} icon={WalletCards} /><KpiCard label="Project positions" value={String(portfolio.stakes.length)} trend={0} icon={Building2} /></section><div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]"><InvestorEditor investor={investor} data={data} /><section className="panel overflow-hidden"><div className="border-b border-[#2c2c54]/60 p-5"><p className="text-[13px] font-semibold">Payment history</p><p className="mt-1 text-[10px] text-[#8181a3]">All distributions received</p></div><div className="max-h-[420px] divide-y divide-[#2c2c54]/45 overflow-auto">{history.map((item) => <div key={item.id} className="table-row flex items-center justify-between gap-3 px-5 py-3.5"><div><p className="text-[10px] font-medium">{data.projects.find((project) => project.id === item.projectId)?.name}</p><p className="mt-1 text-[9px] text-[#77779a]">{item.date}</p></div><p className="tabular text-[11px] font-semibold text-[#4fe8b8]">{money.format(item.amount)}</p></div>)}</div></section></div></>;
}
