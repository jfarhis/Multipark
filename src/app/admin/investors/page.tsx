import { Download, UserPlus } from "lucide-react";
import { dashboardRepository } from "@/lib/data/repository";
import { capitalForStake, distributionsForStake } from "@/lib/calculations";
import { InvestorTable } from "@/components/investor-table";
import { PageHeading } from "@/components/page-heading";

export default async function InvestorsPage() {
  const data = await dashboardRepository.getDashboardData();
  const rows = data.investors.map((investor) => { const stakes = data.stakes.filter((stake) => stake.investorId === investor.id); return { id: investor.id, name: investor.name, email: investor.email, projects: stakes.length, invested: stakes.reduce((sum, stake) => sum + capitalForStake(stake), 0), distributed: stakes.reduce((sum, stake) => sum + distributionsForStake(data, stake), 0) }; });
  return <><PageHeading eyebrow="Capital partners" title="Investor management" description="Search, review, and manage ownership across every project." action={<div className="flex gap-2"><button className="secondary-button px-3"><Download size={13} />Export</button><button className="primary-button px-3"><UserPlus size={14} />Add investor</button></div>} /><InvestorTable rows={rows} /></>;
}
