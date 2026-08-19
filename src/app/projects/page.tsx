import { FolderSearch } from "lucide-react";
import { redirect } from "next/navigation";
import { PageHeading } from "@/components/page-heading";
import { ProjectCard } from "@/components/project-card";
import { getSession } from "@/lib/auth";
import { dashboardRepository } from "@/lib/data/repository";

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const [session, data, query] = await Promise.all([
    getSession(),
    dashboardRepository.getDashboardData(),
    searchParams.then((params) => params.q?.trim().toLowerCase() ?? ""),
  ]);
  if (!session) redirect("/login");

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
      <PageHeading eyebrow="Portfolio" title={query ? `Results for “${query}”` : "Projects"} description={session.role === "admin" ? "Open any development for operating, investor, and document details." : "Your active Gasfar Capital investments."} />
      {projects.length ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {projects.map((project) => {
            const stake = session.role === "investor" ? data.stakes.find((item) => item.investorId === session.investorId && item.projectId === project.id) : undefined;
            return <ProjectCard key={project.id} project={project} data={data} stake={stake} />;
          })}
        </div>
      ) : (
        <div className="panel grid min-h-64 place-items-center p-8 text-center"><div><FolderSearch className="mx-auto text-[#6b7970]" size={26} /><p className="mt-4 text-[12px] font-semibold">No projects found</p><p className="mt-1 text-[9px] text-[#6f7c74]">Try another search, or add an investor position first.</p></div></div>
      )}
    </>
  );
}
