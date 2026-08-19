import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getDashboardData } from "@/lib/data/repository";
import { DocumentTable } from "@/components/document-table";
import { PageHeading } from "@/components/page-heading";

export default async function InvestorDocumentsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const data = await getDashboardData(session);
  const investorId = session.investorId ?? ""; const projectIds = new Set(data.stakes.filter((stake) => stake.investorId === investorId).map((stake) => stake.projectId));
  const visible = data.documents.filter((document) => projectIds.has(document.projectId) && (document.investorId === null || document.investorId === investorId)); const rows = visible.map((document) => ({ id: document.id, title: document.title, projectId: document.projectId, project: data.projects.find((project) => project.id === document.projectId)?.name ?? "Proyecto", investorId: document.investorId, investor: document.investorId ? "Privado para ti" : "Todo el proyecto", type: document.type, date: document.uploadedDate, url: document.fileUrl }));
  return <><PageHeading eyebrow="Biblioteca privada" title="Avances y documentos" description="Fotos de obra, reportes y comprobantes de pago de los proyectos en los que inviertes." /><DocumentTable rows={rows} /></>;
}
