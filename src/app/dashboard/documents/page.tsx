import { getSession } from "@/lib/auth";
import { dashboardRepository } from "@/lib/data/repository";
import { DocumentTable } from "@/components/document-table";
import { PageHeading } from "@/components/page-heading";

export default async function InvestorDocumentsPage() {
  const [session, data] = await Promise.all([getSession(), dashboardRepository.getDashboardData()]); const investorId = session?.investorId ?? "inv-001"; const projectIds = new Set(data.stakes.filter((stake) => stake.investorId === investorId).map((stake) => stake.projectId));
  const visible = data.documents.filter((document) => projectIds.has(document.projectId) && (document.investorId === null || document.investorId === investorId)); const rows = visible.map((document) => ({ id: document.id, title: document.title, project: data.projects.find((project) => project.id === document.projectId)?.name ?? "Project", investor: document.investorId ? "Private to you" : "Project-wide", type: document.type, date: document.uploadedDate, url: document.fileUrl }));
  return <><PageHeading eyebrow="Private file library" title="Documents & receipts" description="Your distribution receipts and project-wide reports, scoped to positions you own." /><DocumentTable rows={rows} /></>;
}
