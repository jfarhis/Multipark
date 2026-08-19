import { getSession } from "@/lib/auth";
import { dashboardRepository } from "@/lib/data/repository";
import { DocumentTable } from "@/components/document-table";
import { PageHeading } from "@/components/page-heading";

export default async function InvestorDocumentsPage() {
  const [session, data] = await Promise.all([getSession(), dashboardRepository.getDashboardData()]); const investorId = session?.investorId ?? ""; const projectIds = new Set(data.stakes.filter((stake) => stake.investorId === investorId).map((stake) => stake.projectId));
  const visible = data.documents.filter((document) => projectIds.has(document.projectId) && (document.investorId === null || document.investorId === investorId)); const rows = visible.map((document) => ({ id: document.id, title: document.title, projectId: document.projectId, project: data.projects.find((project) => project.id === document.projectId)?.name ?? "Proyecto", investorId: document.investorId, investor: document.investorId ? "Privado para ti" : "Todo el proyecto", type: document.type, date: document.uploadedDate, url: document.fileUrl }));
  return <><PageHeading eyebrow="Biblioteca privada" title="Documentos y comprobantes" description="Tus comprobantes de distribución y reportes de los proyectos en los que participas." /><DocumentTable rows={rows} /></>;
}
