import type { ProjectStatus } from "@/lib/types";

const styles: Record<ProjectStatus, string> = {
  "pre-construction": "bg-[#38bdf8]/10 text-[#7dd3fc] ring-[#38bdf8]/20",
  "in-progress": "bg-[#4d7cfe]/12 text-[#8fb0ff] ring-[#4d7cfe]/22",
  delayed: "bg-[#ff5470]/10 text-[#ff788e] ring-[#ff5470]/22",
  complete: "bg-[#2dd4a7]/10 text-[#4be3ba] ring-[#2dd4a7]/20",
};

const labels: Record<ProjectStatus, string> = {
  "pre-construction": "Preconstrucción",
  "in-progress": "En progreso",
  delayed: "Retrasado",
  complete: "Terminado",
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-semibold capitalize ring-1 ring-inset ${styles[status]}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {labels[status]}
    </span>
  );
}
