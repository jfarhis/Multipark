import { LockKeyhole } from "lucide-react";
import { requireAdminSession } from "@/lib/auth";
import { getDashboardData } from "@/lib/data/repository";
import { DocumentTable } from "@/components/document-table";
import { PageHeading } from "@/components/page-heading";
import { DocumentUploadForm } from "@/components/document-upload-form";

export default async function AdminDocumentsPage() {
  const data = await getDashboardData(await requireAdminSession());
  const rows = data.documents.filter((document) => !document.id.startsWith("distribution-receipt-")).map((document) => ({ id: document.id, title: document.title, projectId: document.projectId, project: data.projects.find((project) => project.id === document.projectId)?.name ?? "Sin asignar", investorId: document.investorId, investor: document.investorId ? data.investors.find((investor) => investor.id === document.investorId)?.name ?? "Desconocido" : "Todos los inversionistas del proyecto", type: document.type, date: document.uploadedDate, url: document.fileUrl }));
  return <><PageHeading eyebrow="Avances del proyecto" title="Fotos, reportes y documentos" description="Publica avances de construcción para los inversionistas y controla exactamente quién puede ver cada archivo." action={<div className="flex items-center gap-2 rounded-xl border border-white/8 bg-[#131a30] px-3 py-2 text-[13px] text-[#8a93b2]"><LockKeyhole size={15} className="text-[#2dd4a7]" />Almacenamiento privado conectado</div>} /><DocumentUploadForm data={data} /><DocumentTable rows={rows} data={data} editable /></>;
}
