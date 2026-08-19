import { DistributionManager } from "@/components/distribution-manager";
import { PageHeading } from "@/components/page-heading";
import { requireAdminSession } from "@/lib/auth";
import { getDashboardData } from "@/lib/data/repository";

export default async function AdminDistributionsPage() {
  const data = await getDashboardData(await requireAdminSession());
  return <><PageHeading eyebrow="Pagos en pesos mexicanos" title="Pagos a inversionistas" description="Registra cada distribución en MXN, adjunta su comprobante y publica el movimiento en el panel privado del inversionista." /><DistributionManager data={data} /></>;
}
