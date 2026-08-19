import { DistributionManager } from "@/components/distribution-manager";
import { PageHeading } from "@/components/page-heading";
import { dashboardRepository } from "@/lib/data/repository";

export default async function AdminDistributionsPage() {
  const data = await dashboardRepository.getDashboardData();
  return <><PageHeading eyebrow="Payments" title="Distribution management" description="Record payments, correct details, attach receipts, and control the history investors see." /><DistributionManager data={data} /></>;
}
