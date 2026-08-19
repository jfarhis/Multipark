import { FolderSearch } from "lucide-react";
import { redirect } from "next/navigation";
import { PageHeading } from "@/components/page-heading";
import { ProjectCard } from "@/components/project-card";
import { getSession } from "@/lib/auth";
import { getDashboardData } from "@/lib/data/repository";

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const [session, query] = await Promise.all([
    getSession(),
    searchParams.then((params) => params.q?.trim().toLowerCase() ?? ""),
  ]);
  if (!session) redirect("/login");
  const data = await getDashboardData(session);

  const allowedProjectIds = session.role === "investor"
    ? new Set(data.stakes.filter((stake) => stake.investorId === session.investorId).map((stake) => stake.projectId))
    : null;
  const projects = data.projects.filter((project) => {
    const allowed = !allowedProjectIds || allowedProjectIds.has(project.id);
    const matches = !query || `${project.name} ${project.location} ${project.status}`.toLowerCase().includes(query);
    return allowed && matches;
  });

  return (
    <>
      <PageHeading eyebrow="Portafolio" title={query ? `Resultados para “${query}”` : "Proyectos"} description={session.role === "admin" ? "Abre cualquier proyecto para administrar sus datos, inversionistas y documentos." : "Tus inversiones activas en Gasfar Capital."} />
      {projects.length ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {projects.map((project) => {
            const stake = session.role === "investor" ? data.stakes.find((item) => item.investorId === session.investorId && item.projectId === project.id) : undefined;
            return <ProjectCard key={project.id} project={project} data={data} stake={stake} />;
          })}
        </div>
      ) : (
        <div className="panel grid min-h-64 place-items-center p-8 text-center"><div><FolderSearch className="mx-auto text-[#6b7594]" size={26} /><p className="mt-4 text-[15px] font-semibold">No hay proyectos</p><p className="mt-1 text-[12px] text-[#6b7594]">{session.role === "admin" ? "Crea tu primer proyecto desde la página de Resumen." : "Tu administrador todavía no te ha asignado una participación."}</p></div></div>
      )}
    </>
  );
}
