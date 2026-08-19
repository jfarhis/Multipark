import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { dashboardRepository } from "@/lib/data/repository";
import { ProjectDetail } from "@/components/project-detail";

export default async function ProjectPage({ params }: PageProps<"/projects/[projectId]">) {
  const [{ projectId }, session, data] = await Promise.all([params, getSession(), dashboardRepository.getDashboardData()]);
  if (!session) redirect("/login");
  const project = data.projects.find((item) => item.id === projectId);
  if (!project) notFound();
  if (session.role === "investor" && !data.stakes.some((stake) => stake.investorId === session.investorId && stake.projectId === projectId)) notFound();
  return <ProjectDetail data={data} project={project} session={session} />;
}
