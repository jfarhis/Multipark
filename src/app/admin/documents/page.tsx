import { FolderSync } from "lucide-react";
import { dashboardRepository } from "@/lib/data/repository";
import { DocumentTable } from "@/components/document-table";
import { PageHeading } from "@/components/page-heading";

export default async function AdminDocumentsPage() {
  const data = await dashboardRepository.getDashboardData();
  const rows = data.documents.map((document) => ({ id: document.id, title: document.title, project: data.projects.find((project) => project.id === document.projectId)?.name ?? "Unassigned", investor: document.investorId ? data.investors.find((investor) => investor.id === document.investorId)?.name ?? "Unknown" : "All project investors", type: document.type, date: document.uploadedDate, url: document.fileUrl }));
  return <><PageHeading eyebrow="GitHub document store" title="Documents & receipts" description="Files in the repository’s receipts folder appear automatically. Filter the synchronized library by project or investor." action={<div className="flex items-center gap-2 rounded-xl border border-[#2c2c54] bg-[#1a1a3a] px-3 py-2 text-[10px] text-[#8d8dae]"><FolderSync size={13} className="text-[#4fe8b8]" />Last synced 2 minutes ago</div>} /><DocumentTable rows={rows} canSync /></>;
}
