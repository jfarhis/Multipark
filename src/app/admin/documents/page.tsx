import { LockKeyhole } from "lucide-react";
import { requireAdminSession } from "@/lib/auth";
import { getDashboardData } from "@/lib/data/repository";
import { DocumentTable } from "@/components/document-table";
import { PageHeading } from "@/components/page-heading";
import { DocumentUploadForm } from "@/components/document-upload-form";

export default async function AdminDocumentsPage() {
  const data = await getDashboardData(await requireAdminSession());
  const rows = data.documents.filter((document) => !document.id.startsWith("distribution-receipt-")).map((document) => ({ id: document.id, title: document.title, projectId: document.projectId, project: data.projects.find((project) => project.id === document.projectId)?.name ?? "Sin asignar", investorId: document.investorId, investor: document.investorId ? data.investors.find((investor) => investor.id === document.investorId)?.name ?? "Desconocido" : "Todos los inversionistas del proyecto", type: document.type, date: document.uploadedDate, url: document.fileUrl }));
  return <><PageHeading eyebrow="Bóveda privada" title="Documentos y comprobantes" description="Carga, edita, reemplaza o elimina archivos y controla exactamente quién puede verlos." action={<div className="flex items-center gap-2 rounded-xl border border-white/8 bg-[#111714] px-3 py-2 text-[10px] text-[#84908a]"><LockKeyhole size={13} className="text-[#4fe8b8]" />Almacenamiento privado conectado</div>} /><DocumentUploadForm data={data} /><DocumentTable rows={rows} data={data} editable /></>;
}
