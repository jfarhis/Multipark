import type { ProjectStatus } from "@/lib/types";

const styles: Record<ProjectStatus, string> = {
  "pre-construction": "bg-[#41b8e6]/10 text-[#70caed] ring-[#41b8e6]/20",
  "in-progress": "bg-[#8b72ff]/12 text-[#aa99ff] ring-[#8b72ff]/22",
  delayed: "bg-[#ff5470]/10 text-[#ff788e] ring-[#ff5470]/22",
  complete: "bg-[#27d797]/10 text-[#47e1a7] ring-[#27d797]/20",
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[8px] font-semibold capitalize ring-1 ring-inset ${styles[status]}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {status.replace("-", " ")}
    </span>
  );
}
