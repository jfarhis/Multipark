import { DistributionManager } from "@/components/distribution-manager";
import { PageHeading } from "@/components/page-heading";
import { dashboardRepository } from "@/lib/data/repository";

export default async function AdminDistributionsPage() {
  const data = await dashboardRepository.getDashboardData();
  return <><PageHeading eyebrow="Pagos" title="Administración de distribuciones" description="Registra pagos, corrige datos, adjunta comprobantes y controla el historial visible para inversionistas." /><DistributionManager data={data} /></>;
}
