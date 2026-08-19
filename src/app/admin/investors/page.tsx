import { UserPlus } from "lucide-react";
import { requireAdminSession } from "@/lib/auth";
import { getDashboardData } from "@/lib/data/repository";
import { capitalForStake, distributionsForStake } from "@/lib/calculations";
import { InvestorTable } from "@/components/investor-table";
import { PageHeading } from "@/components/page-heading";
import { InvestorInviteForm } from "@/components/investor-invite-form";
import { ExportButton } from "@/components/export-button";

export default async function InvestorsPage() {
  const data = await getDashboardData(await requireAdminSession());
  const rows = data.investors.map((investor) => { const stakes = data.stakes.filter((stake) => stake.investorId === investor.id); return { id: investor.id, name: investor.name, email: investor.email, projects: stakes.length, invested: stakes.reduce((sum, stake) => sum + capitalForStake(stake), 0), distributed: stakes.reduce((sum, stake) => sum + distributionsForStake(data, stake), 0) }; });
  return <><PageHeading eyebrow="Socios de capital" title="Administración de inversionistas" description="Busca, revisa, invita y administra participaciones en cada proyecto." action={<div className="flex gap-2"><ExportButton filename="gasfar-inversionistas.csv" rows={rows.map((row) => ({ Nombre: row.name, Correo: row.email, Participaciones: row.projects, Invertido: row.invested, Distribuido: row.distributed }))} /><a href="#invite-investor" className="primary-button px-3"><UserPlus size={14} />Agregar inversionista</a></div>} /><InvestorTable rows={rows} /><InvestorInviteForm /></>;
}
