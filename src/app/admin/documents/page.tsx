import { LockKeyhole } from "lucide-react";
import { dashboardRepository } from "@/lib/data/repository";
import { DocumentTable } from "@/components/document-table";
import { PageHeading } from "@/components/page-heading";
import { DocumentUploadForm } from "@/components/document-upload-form";

export default async function AdminDocumentsPage() {
  const data = await dashboardRepository.getDashboardData();
  const rows = data.documents.map((document) => ({ id: document.id, title: document.title, project: data.projects.find((project) => project.id === document.projectId)?.name ?? "Unassigned", investor: document.investorId ? data.investors.find((investor) => investor.id === document.investorId)?.name ?? "Unknown" : "All project investors", type: document.type, date: document.uploadedDate, url: document.fileUrl }));
  return <><PageHeading eyebrow="Private document vault" title="Documents & receipts" description="Upload confidential files and control whether they are visible to one investor or an entire project." action={<div className="flex items-center gap-2 rounded-xl border border-white/8 bg-[#111714] px-3 py-2 text-[10px] text-[#84908a]"><LockKeyhole size={13} className="text-[#4fe8b8]" />Private storage connected</div>} /><DocumentUploadForm data={data} /><DocumentTable rows={rows} /></>;
}
