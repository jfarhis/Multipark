import type { ProjectStatus } from "@/lib/types";

const styles: Record<ProjectStatus, string> = {
  "pre-construction": "bg-[#ffa27a]/10 text-[#ffb896] ring-[#ffa27a]/20",
  "in-progress": "bg-[#ff7a2f]/12 text-[#ffab63] ring-[#ff7a2f]/22",
  delayed: "bg-[#ff5470]/10 text-[#ff788e] ring-[#ff5470]/22",
  complete: "bg-[#ffe3a3]/10 text-[#ffe9b8] ring-[#ffe3a3]/20",
};

const labels: Record<ProjectStatus, string> = {
  "pre-construction": "Preconstrucción",
  "in-progress": "En progreso",
  delayed: "Retrasado",
  complete: "Terminado",
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[8px] font-semibold capitalize ring-1 ring-inset ${styles[status]}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {labels[status]}
    </span>
  );
}
