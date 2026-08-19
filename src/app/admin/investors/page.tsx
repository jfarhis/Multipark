import { UserPlus } from "lucide-react";
import { dashboardRepository } from "@/lib/data/repository";
import { capitalForStake, distributionsForStake } from "@/lib/calculations";
import { InvestorTable } from "@/components/investor-table";
import { PageHeading } from "@/components/page-heading";
import { InvestorInviteForm } from "@/components/investor-invite-form";
import { ExportButton } from "@/components/export-button";

export default async function InvestorsPage() {
  const data = await dashboardRepository.getDashboardData();
  const rows = data.investors.map((investor) => { const stakes = data.stakes.filter((stake) => stake.investorId === investor.id); return { id: investor.id, name: investor.name, email: investor.email, projects: stakes.length, invested: stakes.reduce((sum, stake) => sum + capitalForStake(stake), 0), distributed: stakes.reduce((sum, stake) => sum + distributionsForStake(data, stake), 0) }; });
  return <><PageHeading eyebrow="Capital partners" title="Investor management" description="Search, review, invite, and manage ownership across every project." action={<div className="flex gap-2"><ExportButton filename="gasfar-investors.csv" rows={rows.map((row) => ({ Name: row.name, Email: row.email, Positions: row.projects, Invested: row.invested, Distributed: row.distributed }))} /><a href="#invite-investor" className="primary-button px-3"><UserPlus size={14} />Invite investor</a></div>} /><InvestorTable rows={rows} /><InvestorInviteForm /></>;
}
